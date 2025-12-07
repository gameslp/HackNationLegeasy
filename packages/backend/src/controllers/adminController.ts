import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../middleware/response';
import { AppError } from '../middleware/errorHandler';
import type { PhaseIdParams, ScanLinksRequest } from '@repo/validation';
import { load as loadHtml } from 'cheerio';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const [totalLaws, totalPhases, totalStages, totalDiscussions, lawsByPhaseRaw] =
    await Promise.all([
      prisma.law.count(),
      prisma.phase.count(),
      prisma.stage.count(),
      prisma.discussion.count(),
      prisma.phase.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
    ]);

  const lawsByPhase: Record<string, number> = {};
  for (const item of lawsByPhaseRaw) {
    lawsByPhase[item.type] = item._count.type;
  }

  sendSuccess(res, {
    totalLaws,
    totalPhases,
    totalStages,
    totalDiscussions,
    lawsByPhase,
  });
});

export const getRecentStage = asyncHandler(async (req: Request, res: Response) => {
  const recentStage = await prisma.stage.findFirst({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      phase: {
        include: {
          law: true,
        },
      },
      files: true,
      discussions: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!recentStage) {
    sendSuccess(res, null);
    return;
  }

  sendSuccess(res, recentStage);
});

export const getAllPhases = asyncHandler(async (req: Request, res: Response) => {
  const phases = await prisma.phase.findMany({
    include: {
      law: true,
      _count: {
        select: {
          stages: true,
        },
      },
    },
    orderBy: {
      startDate: 'desc',
    },
  });

  sendSuccess(res, { phases, total: phases.length });
});

export const getAllStages = asyncHandler(async (req: Request, res: Response) => {
  const stages = await prisma.stage.findMany({
    include: {
      phase: {
        include: {
          law: true,
        },
      },
      _count: {
        select: {
          files: true,
          discussions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  sendSuccess(res, { stages, total: stages.length });
});

const PHASE_LABELS: Record<string, string> = {
  PRECONSULTATION: 'Prekonsultacje',
  RCL: 'RCL',
  SEJM: 'Sejm',
  SENAT: 'Senat',
  PRESIDENT: 'Prezydent',
  JOURNAL: 'Dziennik Ustaw',
};

export const getPhaseName = asyncHandler(async (req, res) => {
  const { phaseId } = req.params as PhaseIdParams;

  const phase = await prisma.phase.findUnique({
    where: { id: phaseId },
    include: {
      law: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!phase) {
    throw new AppError('Phase not found', 'NOT_FOUND', 404);
  }

  const name = PHASE_LABELS[phase.type] ?? phase.type;

  sendSuccess(res, {
    id: phase.id,
    type: phase.type,
    name,
    lawId: phase.lawId,
    lawName: phase.law.name,
  });
});

export const scanLinksForPhase = asyncHandler(async (req: Request, res: Response) => {
  const { link, phaseName, stageName } = req.body as ScanLinksRequest;

  const response = await fetch(link);
  if (!response.ok) {
    throw new AppError(
      `Failed to fetch external link (status ${response.status})`,
      'EXTERNAL_FETCH_ERROR',
      502
    );
  }

  const html = await response.text();
  const $ = loadHtml(html);
  const url = new URL(link);
  const pathCombined = url.pathname + url.search + url.hash;
  const phaseLower = phaseName.toLowerCase();
  const stageLower = stageName ? stageName.toLowerCase() : null;

  const toAbsolute = (href: string | undefined | null) => {
    if (!href) return null;
    try {
      return new URL(href, url.href).toString();
    } catch {
      return null;
    }
  };

  const normalizeLink = (href: string | undefined | null, text?: string) => {
    const abs = toAbsolute(href);
    if (!abs) return null;
    const fileName = extractName(abs, text);
    return { url: abs, name: fileName };
  };

  let links: Array<{ url: string | null; name: string }> = [];
  console.log('Scanning links for phase:', phaseName);
  console.log('Using path combined:', pathCombined);

  if (phaseLower.includes('rcl')) {
    const anchors = $('a')
      .filter((_, el) => {
        const href = $(el).attr('href') || '';
        return href.toLowerCase().includes(pathCombined.toLowerCase());
      })
      .first();

    const parent = anchors.parent().parent();
    links = parent
      .find('a')
      .map((_, el) => normalizeLink($(el).attr('href'), $(el).text()))
      .get()
      .filter((item) => item?.url && isDocument(item.url as string));

  } else if (phaseLower.includes('sejm')) {
    let target = $('h3, h4')
      .filter((_, el) => {
        const text = ($(el).text() || '').toLowerCase();
        return stageLower ? text.includes(stageLower) : false;
      })
      .first();

    console.log('Found heading for Sejm phase:', target.text());
    console.log('element html:', target.html());


    links = target
      .find('a')
      .map((_, el) => normalizeLink($(el).attr('href'), $(el).text()))
      .get();
      // .filter((item) => item?.url && isDocument(item.url as string));

  } else if (phaseLower.includes('senat')) {
    const heading =
      $('h3')
        .filter((_, el) => {
          const text = ($(el).text() || '').toLowerCase();
          return stageLower ? text.includes(stageLower) : false;
        })
        .first() ||
      $('h4')
        .filter((_, el) => {
          const text = ($(el).text() || '').toLowerCase();
          return stageLower ? text.includes(stageLower) : false;
        })
        .first();
    const target = heading.parent();
    links = target
      .find('a')
      .map((_, el) => normalizeLink($(el).attr('href'), $(el).text()))
      .get()
      .filter((item) => item?.url && isDocument(item.url as string));
  } else {
    links = $('a')
      .map((_, el) => normalizeLink($(el).attr('href'), $(el).text()))
      .get()
      .filter((item) => item?.url && isDocument(item.url as string));
  }

  const unique = Array.from(
    new Map(
      links
        .filter((item) => item?.url)
        .map((item) => [item.url as string, item])
    ).values()
  );

  sendSuccess(res, { links: unique, stageName: stageName || null });

  function isDocument(url: string) {
    return (
      url.toLowerCase().endsWith('.pdf') ||
      url.toLowerCase().endsWith('.doc') ||
      url.toLowerCase().endsWith('.docx') ||
      url.toLowerCase().includes('.pdf?') ||
      url.toLowerCase().includes('.doc?') ||
      url.toLowerCase().includes('.docx?')
    );
  }

  function extractName(abs: string, text?: string) {
    const trimmed = text?.trim();
    if (trimmed) return trimmed;
    return decodeURIComponent(abs.split('/').pop() || '').split('?')[0] || abs;
  }
});
