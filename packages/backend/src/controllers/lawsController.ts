import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import type { Prisma, PhaseType } from '@repo/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../middleware/response';
import { AppError } from '../middleware/errorHandler';
import type { GetLawsQuery, CreateLawRequest, UpdateLawRequest } from '@repo/validation';

export const getLaws = asyncHandler(async (req: Request, res: Response) => {
  const { search, phaseType, page = 1, limit = 20 } = req.query as unknown as GetLawsQuery;

  const where: Prisma.LawWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { author: { contains: search } },
    ];
  }

  if (phaseType) {
    where.phases = {
      some: { type: phaseType as PhaseType },
    };
  }

  const [laws, total] = await Promise.all([
    prisma.law.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: 'desc' },
      include: {
        phases: {
          orderBy: { order: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.law.count({ where }),
  ]);

  const lawsWithCurrentPhase = laws.map((law) => ({
    ...law,
    currentPhase: law.phases[0]?.type || null,
    phases: undefined,
  }));

  sendSuccess(res, {
    laws: lawsWithCurrentPhase,
    total,
    page,
    limit,
  });
});

export const getLawById = asyncHandler(async (req: Request, res: Response) => {
  const { lawId } = req.params;

  const law = await prisma.law.findUnique({
    where: { id: lawId },
    include: {
      phases: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!law) {
    throw new AppError('Law not found', 'NOT_FOUND', 404);
  }

  sendSuccess(res, law);
});

export const createLaw = asyncHandler(async (req: Request, res: Response) => {
  const data: CreateLawRequest = req.body;

  const law = await prisma.law.create({
    data: {
      name: data.name,
      author: data.author,
      description: data.description,
      startDate: new Date(data.startDate),
      publishDate: data.publishDate ? new Date(data.publishDate) : null,
    },
  });

  sendSuccess(res, law, 201);
});

export const updateLaw = asyncHandler(async (req: Request, res: Response) => {
  const { lawId } = req.params;
  const data: UpdateLawRequest = req.body;

  const updateData: Prisma.LawUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.author !== undefined) updateData.author = data.author;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
  if (data.publishDate !== undefined) {
    updateData.publishDate = data.publishDate ? new Date(data.publishDate) : null;
  }

  const law = await prisma.law.update({
    where: { id: lawId },
    data: updateData,
  });

  sendSuccess(res, law);
});

export const deleteLaw = asyncHandler(async (req: Request, res: Response) => {
  const { lawId } = req.params;

  await prisma.law.delete({
    where: { id: lawId },
  });

  sendSuccess(res, { success: true });
});

export const getAllStagesForLaw = asyncHandler(async (req: Request, res: Response) => {
  const { lawId } = req.params;

  const law = await prisma.law.findUnique({
    where: { id: lawId },
    include: {
      phases: {
        include: {
          stages: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!law) {
    throw new AppError('Law not found', 'NOT_FOUND', 404);
  }

  const stages = law.phases.flatMap((phase) =>
    phase.stages.map((stage) => ({
      ...stage,
      phaseType: phase.type,
      phaseOrder: phase.order,
    }))
  );

  // Sort by phase order first, then by stage order within phase
  stages.sort((a, b) => {
    if (a.phaseOrder !== b.phaseOrder) {
      return a.phaseOrder - b.phaseOrder;
    }
    return (a.order || 0) - (b.order || 0);
  });

  sendSuccess(res, { stages });
});
