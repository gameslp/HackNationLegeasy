import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../middleware/response';
import { AppError } from '../middleware/errorHandler';
import { generateImpactAnalysis } from '../services/aiService';

/**
 * GET /api/laws/:lawId/impact
 * Pobierz analizę wpływu dla ustawy (wszystkie etapy z analizą)
 */
export const getLawImpactAnalyses = asyncHandler(async (req: Request, res: Response) => {
  const { lawId } = req.params;

  const law = await prisma.law.findUnique({
    where: { id: lawId },
    include: {
      phases: {
        orderBy: { order: 'asc' },
        include: {
          stages: {
            orderBy: { order: 'asc' },
            include: {
              impactAnalysis: true,
            },
          },
        },
      },
    },
  });

  if (!law) {
    throw new AppError('Law not found', 'NOT_FOUND', 404);
  }

  // Zbierz wszystkie etapy z analizami
  const stagesWithAnalysis = law.phases.flatMap((phase) =>
    phase.stages
      .filter((stage) => stage.impactAnalysis?.isPublished)
      .map((stage) => ({
        stageId: stage.id,
        stageName: stage.name,
        stageDate: stage.date,
        phaseId: phase.id,
        phaseType: phase.type,
        analysis: stage.impactAnalysis,
      }))
  );

  sendSuccess(res, {
    law: {
      id: law.id,
      name: law.name,
      description: law.description,
    },
    analyses: stagesWithAnalysis,
  });
});

/**
 * GET /api/stages/:stageId/impact
 * Pobierz analizę wpływu dla konkretnego etapu
 */
export const getStageImpactAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: {
      impactAnalysis: true,
      phase: {
        include: {
          law: true,
        },
      },
    },
  });

  if (!stage) {
    throw new AppError('Stage not found', 'NOT_FOUND', 404);
  }

  // Dla publicznego API - sprawdź czy analiza jest opublikowana
  const analysis = stage.impactAnalysis;
  if (!analysis || !analysis.isPublished) {
    throw new AppError('Impact analysis not found or not published', 'NOT_FOUND', 404);
  }

  sendSuccess(res, {
    stage: {
      id: stage.id,
      name: stage.name,
      date: stage.date,
      author: stage.author,
    },
    phase: {
      id: stage.phase.id,
      type: stage.phase.type,
    },
    law: {
      id: stage.phase.law.id,
      name: stage.phase.law.name,
    },
    analysis,
  });
});

/**
 * POST /api/admin/stages/:stageId/impact/generate
 * Wygeneruj analizę wpływu AI dla etapu
 */
export const generateStageImpactAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: {
      phase: {
        include: {
          law: true,
        },
      },
      impactAnalysis: true,
    },
  });

  if (!stage) {
    throw new AppError('Stage not found', 'NOT_FOUND', 404);
  }

  // Generuj analizę AI
  const aiResult = await generateImpactAnalysis(
    stage.phase.law.name,
    stage.name,
    stage.lawTextContent,
    stage.description
  );

  // Upsert - utwórz lub zaktualizuj analizę
  const analysis = await prisma.impactAnalysis.upsert({
    where: { stageId },
    create: {
      stageId,
      economicScore: aiResult.economicScore,
      socialScore: aiResult.socialScore,
      administrativeScore: aiResult.administrativeScore,
      technologicalScore: aiResult.technologicalScore,
      environmentalScore: aiResult.environmentalScore,
      overallScore: aiResult.overallScore,
      mainAffectedGroup: aiResult.mainAffectedGroup,
      uncertaintyLevel: aiResult.uncertaintyLevel,
      simpleSummary: aiResult.simpleSummary,
      economicDetails: aiResult.economicDetails as object,
      socialDetails: aiResult.socialDetails as object,
      administrativeDetails: aiResult.administrativeDetails as object,
      technologicalDetails: aiResult.technologicalDetails as object,
      environmentalDetails: aiResult.environmentalDetails as object,
      isPublished: false,
      editedByAdmin: false,
    },
    update: {
      economicScore: aiResult.economicScore,
      socialScore: aiResult.socialScore,
      administrativeScore: aiResult.administrativeScore,
      technologicalScore: aiResult.technologicalScore,
      environmentalScore: aiResult.environmentalScore,
      overallScore: aiResult.overallScore,
      mainAffectedGroup: aiResult.mainAffectedGroup,
      uncertaintyLevel: aiResult.uncertaintyLevel,
      simpleSummary: aiResult.simpleSummary,
      economicDetails: aiResult.economicDetails as object,
      socialDetails: aiResult.socialDetails as object,
      administrativeDetails: aiResult.administrativeDetails as object,
      technologicalDetails: aiResult.technologicalDetails as object,
      environmentalDetails: aiResult.environmentalDetails as object,
      generatedAt: new Date(),
      editedByAdmin: false,
    },
  });

  sendSuccess(res, analysis, 201);
});

/**
 * PUT /api/admin/stages/:stageId/impact
 * Zaktualizuj analizę wpływu (edycja ręczna przez admina)
 */
export const updateStageImpactAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;
  const data = req.body;

  const existingAnalysis = await prisma.impactAnalysis.findUnique({
    where: { stageId },
  });

  if (!existingAnalysis) {
    throw new AppError('Impact analysis not found', 'NOT_FOUND', 404);
  }

  const analysis = await prisma.impactAnalysis.update({
    where: { stageId },
    data: {
      ...(data.economicScore !== undefined && { economicScore: data.economicScore }),
      ...(data.socialScore !== undefined && { socialScore: data.socialScore }),
      ...(data.administrativeScore !== undefined && { administrativeScore: data.administrativeScore }),
      ...(data.technologicalScore !== undefined && { technologicalScore: data.technologicalScore }),
      ...(data.environmentalScore !== undefined && { environmentalScore: data.environmentalScore }),
      ...(data.overallScore !== undefined && { overallScore: data.overallScore }),
      ...(data.mainAffectedGroup !== undefined && { mainAffectedGroup: data.mainAffectedGroup }),
      ...(data.uncertaintyLevel !== undefined && { uncertaintyLevel: data.uncertaintyLevel }),
      ...(data.simpleSummary !== undefined && { simpleSummary: data.simpleSummary }),
      ...(data.economicDetails !== undefined && { economicDetails: data.economicDetails }),
      ...(data.socialDetails !== undefined && { socialDetails: data.socialDetails }),
      ...(data.administrativeDetails !== undefined && { administrativeDetails: data.administrativeDetails }),
      ...(data.technologicalDetails !== undefined && { technologicalDetails: data.technologicalDetails }),
      ...(data.environmentalDetails !== undefined && { environmentalDetails: data.environmentalDetails }),
      ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      editedByAdmin: true,
    },
  });

  sendSuccess(res, analysis);
});

/**
 * POST /api/admin/stages/:stageId/impact/publish
 * Opublikuj/ukryj analizę wpływu
 */
export const toggleImpactPublish = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;
  const { isPublished } = req.body;

  const analysis = await prisma.impactAnalysis.update({
    where: { stageId },
    data: { isPublished },
  });

  sendSuccess(res, analysis);
});

/**
 * GET /api/admin/stages/:stageId/impact
 * Pobierz analizę wpływu dla admina (nawet nieopublikowaną)
 */
export const getAdminStageImpactAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: {
      impactAnalysis: true,
      phase: {
        include: {
          law: true,
        },
      },
    },
  });

  if (!stage) {
    throw new AppError('Stage not found', 'NOT_FOUND', 404);
  }

  sendSuccess(res, {
    stage: {
      id: stage.id,
      name: stage.name,
      date: stage.date,
      author: stage.author,
      lawTextContent: stage.lawTextContent ? stage.lawTextContent.substring(0, 500) + '...' : null,
    },
    phase: {
      id: stage.phase.id,
      type: stage.phase.type,
    },
    law: {
      id: stage.phase.law.id,
      name: stage.phase.law.name,
    },
    analysis: stage.impactAnalysis || null,
  });
});

/**
 * GET /api/laws/:lawId/impact/compare
 * Porównaj analizy wpływu między dwoma etapami
 */
export const compareImpactAnalyses = asyncHandler(async (req: Request, res: Response) => {
  const { lawId } = req.params;
  const { sourceStageId, targetStageId } = req.query as { sourceStageId: string; targetStageId: string };

  if (!sourceStageId || !targetStageId) {
    throw new AppError('Both sourceStageId and targetStageId are required', 'BAD_REQUEST', 400);
  }

  const [sourceStage, targetStage] = await Promise.all([
    prisma.stage.findUnique({
      where: { id: sourceStageId },
      include: { impactAnalysis: true },
    }),
    prisma.stage.findUnique({
      where: { id: targetStageId },
      include: { impactAnalysis: true },
    }),
  ]);

  if (!sourceStage || !targetStage) {
    throw new AppError('One or both stages not found', 'NOT_FOUND', 404);
  }

  if (!sourceStage.impactAnalysis || !targetStage.impactAnalysis) {
    throw new AppError('One or both stages do not have impact analysis', 'NOT_FOUND', 404);
  }

  const source = sourceStage.impactAnalysis;
  const target = targetStage.impactAnalysis;

  // Generuj diff
  const comparison = {
    sourceStage: {
      id: sourceStage.id,
      name: sourceStage.name,
      date: sourceStage.date,
    },
    targetStage: {
      id: targetStage.id,
      name: targetStage.name,
      date: targetStage.date,
    },
    changes: [
      {
        category: 'Ekonomiczny',
        before: source.economicScore,
        after: target.economicScore,
        change: target.economicScore - source.economicScore,
      },
      {
        category: 'Społeczny',
        before: source.socialScore,
        after: target.socialScore,
        change: target.socialScore - source.socialScore,
      },
      {
        category: 'Administracyjny',
        before: source.administrativeScore,
        after: target.administrativeScore,
        change: target.administrativeScore - source.administrativeScore,
      },
      {
        category: 'Technologiczny',
        before: source.technologicalScore,
        after: target.technologicalScore,
        change: target.technologicalScore - source.technologicalScore,
      },
      {
        category: 'Środowiskowy',
        before: source.environmentalScore,
        after: target.environmentalScore,
        change: target.environmentalScore - source.environmentalScore,
      },
    ],
    overallChange: {
      before: source.overallScore,
      after: target.overallScore,
      change: target.overallScore - source.overallScore,
    },
  };

  sendSuccess(res, comparison);
});
