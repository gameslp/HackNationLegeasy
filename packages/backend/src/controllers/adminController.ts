import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../middleware/response';
import { AppError } from '../middleware/errorHandler';
import type { PhaseIdParams, ScanLinksRequest, ScrapeRclStageRequest, ScrapeRclProjectRequest } from '@repo/validation';
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
      url.toLowerCase().includes('.docx?') ||
      url.toLowerCase().includes('.zip') ||
      url.toLowerCase().includes('.rar') ||
      url.toLowerCase().includes('.zip?') ||
      url.toLowerCase().includes('.rar?') 
    );
  }

  function extractName(abs: string, text?: string) {
    const trimmed = text?.trim();
    if (trimmed) return trimmed;
    return decodeURIComponent(abs.split('/').pop() || '').split('?')[0] || abs;
  }
});

// Types for RCL stage scraping response
interface RclScrapedFile {
  url: string;
  name: string;
  author: string | null;
  createdAt: string | null;
}

interface RclScrapedDirectory {
  id: string;
  name: string;
  lastModified: string | null;
  url: string;
}

interface RclScrapedStage {
  stageId: string;
  stageName: string;
  lastModified: string | null;
  directories: RclScrapedDirectory[];
  files: RclScrapedFile[];
}

export const scrapeRclStage = asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body as ScrapeRclStageRequest;

  // Extract stage ID from URL hash (e.g., #13169190)
  const urlObj = new URL(url);
  const stageId = urlObj.hash.replace('#', '');

  if (!stageId) {
    throw new AppError(
      'URL must contain a stage ID in the hash (e.g., #13169190)',
      'INVALID_URL',
      400
    );
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new AppError(
      `Failed to fetch RCL page (status ${response.status})`,
      'EXTERNAL_FETCH_ERROR',
      502
    );
  }

  const html = await response.text();
  const $ = loadHtml(html);

  const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

  // Find the stage element by ID
  const stageElement = $(`li#${stageId}`);

  if (stageElement.length === 0) {
    throw new AppError(
      `Stage element with ID ${stageId} not found on the page`,
      'STAGE_NOT_FOUND',
      404
    );
  }

  // Extract stage name from the main anchor link
  const stageNameEl = stageElement.find('a').first();
  const stageName = stageNameEl.text().trim();

  // Extract last modification date
  const modDateText = stageElement.find('.small2').text();
  const modDateMatch = modDateText.match(/Data ostatniej modyfikacji:\s*(\d{2}-\d{2}-\d{4})/);
  const lastModified = modDateMatch ? modDateMatch[1] : null;

  // Extract child directories (li.childdir)
  const directories: RclScrapedDirectory[] = [];
  stageElement.find('li.childdir').each((_, el) => {
    const dirEl = $(el);
    const dirId = dirEl.attr('id') || '';
    const dirAnchor = dirEl.find('a').first();
    const dirName = dirAnchor.text().trim();
    const dirHref = dirAnchor.attr('href');
    const dirUrl = dirHref ? new URL(dirHref, baseUrl).toString() : '';

    // Extract date from the directory's small2 div
    const dirDateText = dirEl.find('.small2').text();
    const dirDateMatch = dirDateText.match(/(\d{2}-\d{2}-\d{4})/);
    const dirLastModified = dirDateMatch ? dirDateMatch[1] : null;

    if (dirId && dirName) {
      directories.push({
        id: dirId,
        name: dirName,
        lastModified: dirLastModified,
        url: dirUrl,
      });
    }
  });

  // Extract document files (li.doc)
  const files: RclScrapedFile[] = [];
  stageElement.find('li.doc').each((_, el) => {
    const docEl = $(el);
    const docAnchor = docEl.find('a').first();
    const docHref = docAnchor.attr('href');
    const docName = docAnchor.text().trim();
    const docUrl = docHref ? new URL(docHref, baseUrl).toString() : '';

    // Extract author and created date from the row
    // Format: "autor1, autor2 data utworzenia: dd-mm-yyyy"
    const infoText = docEl.find('.small2').text().trim();
    let author: string | null = null;
    let createdAt: string | null = null;

    const createdMatch = infoText.match(/data utworzenia:\s*(\d{2}-\d{2}-\d{4})/);
    if (createdMatch) {
      createdAt = createdMatch[1];
      // Author is everything before "data utworzenia:"
      const authorPart = infoText.split('data utworzenia:')[0].trim();
      // Remove trailing comma if present
      author = authorPart.replace(/,\s*$/, '').trim() || null;
    } else {
      // If no created date pattern, the entire text might be author
      author = infoText || null;
    }

    if (docUrl && docName) {
      files.push({
        url: docUrl,
        name: docName,
        author,
        createdAt,
      });
    }
  });

  const result: RclScrapedStage = {
    stageId,
    stageName,
    lastModified,
    directories,
    files,
  };

  sendSuccess(res, result);
});

// Types for RCL project scraping response
interface RclProjectStage {
  stageNumber: number;
  stageName: string;
  stageId: string | null;
  isActive: boolean;
  lastModified: string | null;
  catalogUrl: string | null;
}

interface RclScrapedProject {
  projectId: string;
  projectTitle: string;
  stages: RclProjectStage[];
}

export const scrapeRclProject = asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body as ScrapeRclProjectRequest;

  // Extract project ID from URL (e.g., /projekt/12404152/)
  const urlObj = new URL(url);
  const projectIdMatch = urlObj.pathname.match(/\/projekt\/(\d+)/);

  if (!projectIdMatch) {
    throw new AppError(
      'URL must be an RCL project URL (e.g., https://legislacja.rcl.gov.pl/projekt/12404152/)',
      'INVALID_URL',
      400
    );
  }

  const projectId = projectIdMatch[1];

  const response = await fetch(url);
  if (!response.ok) {
    throw new AppError(
      `Failed to fetch RCL project page (status ${response.status})`,
      'EXTERNAL_FETCH_ERROR',
      502
    );
  }

  const html = await response.text();
  const $ = loadHtml(html);

  const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

  // Extract project title from .projectTitle .rcl-title or fallback
  const projectTitle = $('.projectTitle .rcl-title').text().trim() ||
                       $('h2').first().text().trim() ||
                       $('title').text().trim();

  // Find all timeline items (stages)
  const stages: RclProjectStage[] = [];

  // The timeline has li elements with id, containing:
  // - cbp_tmlabel (active with catalog) or cbp_tmlabel_active (current active) or cbp_tmlabel_notstart (inactive)
  $('.cbp_tmtimeline > li').each((index, el) => {
    const item = $(el);

    // Find the label element - can be cbp_tmlabel, cbp_tmlabel_active, or cbp_tmlabel_notstart
    const activeLabelEl = item.find('.cbp_tmlabel').first();
    const currentLabelEl = item.find('.cbp_tmlabel_active').first();
    const inactiveLabelEl = item.find('.cbp_tmlabel_notstart').first();

    const labelEl = activeLabelEl.length > 0 ? activeLabelEl :
                    currentLabelEl.length > 0 ? currentLabelEl :
                    inactiveLabelEl;

    const isActive = activeLabelEl.length > 0 || currentLabelEl.length > 0;

    // Get stage name - it's either in an <a> tag or directly as text
    const anchorEl = labelEl.find('a[href*="/katalog/"]').first();
    let stageName = '';

    if (anchorEl.length > 0) {
      stageName = anchorEl.text().trim();
    } else {
      // For inactive stages, the name is just text in the first div
      const firstDiv = labelEl.find('div').first();
      stageName = firstDiv.text().trim().split('\n')[0].trim();
    }

    // Extract stage number from the name (e.g., "1. Zgłoszenie projektu" -> 1)
    const stageNumberMatch = stageName.match(/^\s*(\d+)\./);
    const stageNumber = stageNumberMatch ? parseInt(stageNumberMatch[1], 10) : index + 1;

    // Find catalog link if exists
    let stageId: string | null = null;
    let catalogUrl: string | null = null;
    let lastModified: string | null = null;

    // Look for catalog link in the stage content
    if (anchorEl.length > 0) {
      const href = anchorEl.attr('href');
      if (href) {
        // Extract stage ID from href like /projekt/12404152/katalog/13169165#13169165
        const stageIdMatch = href.match(/\/katalog\/(\d+)/);
        if (stageIdMatch) {
          stageId = stageIdMatch[1];
          catalogUrl = new URL(href, baseUrl).toString();
        }
      }
    }

    // Extract last modified date from .small2
    const small2El = labelEl.find('.small2');
    if (small2El.length > 0) {
      const dateText = small2El.text();
      const dateMatch = dateText.match(/(\d{2}-\d{2}-\d{4})/);
      if (dateMatch) {
        lastModified = dateMatch[1];
      }
    }

    if (stageName) {
      stages.push({
        stageNumber,
        stageName,
        stageId,
        isActive,
        lastModified,
        catalogUrl,
      });
    }
  });

  const result: RclScrapedProject = {
    projectId,
    projectTitle,
    stages,
  };

  sendSuccess(res, result);
});
