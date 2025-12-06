import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../middleware/response';
import type { CreateDiscussionRequest } from '@repo/validation';

export const getDiscussions = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;

  const discussions = await prisma.discussion.findMany({
    where: { stageId },
    orderBy: { createdAt: 'asc' },
  });

  sendSuccess(res, { discussions });
});

export const createDiscussion = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;
  const data: CreateDiscussionRequest = req.body;

  const discussion = await prisma.discussion.create({
    data: {
      stageId,
      nickname: data.nickname,
      content: data.content,
    },
  });

  sendSuccess(res, discussion, 201);
});
