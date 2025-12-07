import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import type { Prisma } from '@repo/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../middleware/response';
import { AppError } from '../middleware/errorHandler';
import type { CreatePhaseRequest, UpdatePhaseRequest } from '@repo/validation';

export const getPhases = asyncHandler(async (req: Request, res: Response) => {
  const { lawId } = req.params;

  const phases = await prisma.phase.findMany({
    where: { lawId },
    orderBy: { order: 'asc' },
  });

  sendSuccess(res, { phases });
});

export const getPhaseById = asyncHandler(async (req: Request, res: Response) => {
  const { phaseId } = req.params;

  const phase = await prisma.phase.findUnique({
    where: { id: phaseId },
    include: {
      stages: {
        orderBy: { order: 'asc' },
      },
      // Dla fazy PRECONSULTATION - pobierz powiązany pomysł z wszystkimi danymi
      idea: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
          surveyResponses: true,
          opinions: {
            include: {
              answers: {
                include: {
                  question: true,
                },
              },
            },
          },
          timeline: {
            orderBy: { order: 'asc' },
          },
          attachments: {
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });

  if (!phase) {
    throw new AppError('Phase not found', 'NOT_FOUND', 404);
  }

  sendSuccess(res, phase);
});

export const createPhase = asyncHandler(async (req: Request, res: Response) => {
  const { lawId } = req.params;
  const data: CreatePhaseRequest = req.body;

  // Get the max order for this law's phases
  const maxOrderPhase = await prisma.phase.findFirst({
    where: { lawId },
    orderBy: { order: 'desc' },
  });
  const nextOrder = data.order || (maxOrderPhase?.order || 0) + 1;

  const phase = await prisma.phase.create({
    data: {
      lawId,
      type: data.type,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      order: nextOrder,
    },
  });

  sendSuccess(res, phase, 201);
});

export const updatePhase = asyncHandler(async (req: Request, res: Response) => {
  const { phaseId } = req.params;
  const data: UpdatePhaseRequest = req.body;

  const updateData: Prisma.PhaseUpdateInput = {};

  if (data.type !== undefined) updateData.type = data.type;
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) {
    updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  }
  if (data.order !== undefined) updateData.order = data.order;

  const phase = await prisma.phase.update({
    where: { id: phaseId },
    data: updateData,
  });

  sendSuccess(res, phase);
});

export const deletePhase = asyncHandler(async (req: Request, res: Response) => {
  const { phaseId } = req.params;

  await prisma.phase.delete({
    where: { id: phaseId },
  });

  sendSuccess(res, { success: true });
});
