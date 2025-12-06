import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../middleware/response';

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
