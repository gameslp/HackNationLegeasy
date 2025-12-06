import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../middleware/response.js';

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
