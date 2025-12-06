import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import type { Prisma } from '@repo/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../middleware/response';
import { AppError } from '../middleware/errorHandler';
import { computeDiff } from '../services/diffService';
import { analyzeStage, analyzeFile, analyzeDiff } from '../services/aiService';
import { extractTextFromPdf } from '../services/pdfService';
import type { CreateStageRequest, UpdateStageRequest, DiffQuery, AnalyzeRequest } from '@repo/validation';
import fs from 'fs/promises';
import path from 'path';

export const getStages = asyncHandler(async (req: Request, res: Response) => {
  const { phaseId } = req.params;

  const stages = await prisma.stage.findMany({
    where: { phaseId },
    orderBy: { order: 'asc' },
  });

  sendSuccess(res, { stages });
});

export const getStageById = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: {
      files: {
        orderBy: { createdAt: 'asc' },
      },
      discussions: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!stage) {
    throw new AppError('Stage not found', 'NOT_FOUND', 404);
  }

  sendSuccess(res, stage);
});

export const createStage = asyncHandler(async (req: Request, res: Response) => {
  const { phaseId } = req.params;
  const data: CreateStageRequest = req.body;

  const maxOrderStage = await prisma.stage.findFirst({
    where: { phaseId },
    orderBy: { order: 'desc' },
  });
  const nextOrder = data.order || (maxOrderStage?.order || 0) + 1;

  const stage = await prisma.stage.create({
    data: {
      phaseId,
      name: data.name,
      date: new Date(data.date),
      author: data.author,
      description: data.description,
      governmentLinks: JSON.stringify(data.governmentLinks || []),
      lawTextContent: data.lawTextContent,
      order: nextOrder,
    },
  });

  sendSuccess(res, stage, 201);
});

export const updateStage = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;
  const data: UpdateStageRequest = req.body;

  const updateData: Prisma.StageUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.date !== undefined) updateData.date = new Date(data.date);
  if (data.author !== undefined) updateData.author = data.author;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.governmentLinks !== undefined) {
    updateData.governmentLinks = JSON.stringify(data.governmentLinks);
  }
  if (data.lawTextContent !== undefined) updateData.lawTextContent = data.lawTextContent;
  if (data.order !== undefined) updateData.order = data.order;

  const stage = await prisma.stage.update({
    where: { id: stageId },
    data: updateData,
  });

  sendSuccess(res, stage);
});

export const deleteStage = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: { files: true },
  });

  if (stage) {
    for (const file of stage.files) {
      try {
        await fs.unlink(file.filePath);
      } catch (e) {
        console.error(`Failed to delete file: ${file.filePath}`);
      }
    }
  }

  await prisma.stage.delete({
    where: { id: stageId },
  });

  sendSuccess(res, { success: true });
});

export const getDiff = asyncHandler(async (req: Request, res: Response) => {
  const { lawId } = req.params;
  const { sourceStageId, targetStageId } = req.query as unknown as DiffQuery;

  const [sourceStage, targetStage] = await Promise.all([
    prisma.stage.findUnique({ where: { id: sourceStageId } }),
    prisma.stage.findUnique({ where: { id: targetStageId } }),
  ]);

  if (!sourceStage || !targetStage) {
    throw new AppError('Stage not found', 'NOT_FOUND', 404);
  }

  const diffResult = computeDiff(sourceStage.lawTextContent, targetStage.lawTextContent);

  sendSuccess(res, {
    sourceStage,
    targetStage,
    ...diffResult,
  });
});

export const analyzeStageHandler = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;
  const { fileId } = req.body as AnalyzeRequest;

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: {
      files: true,
      phase: {
        include: {
          stages: {
            where: {
              order: {
                lt: (
                  await prisma.stage.findUnique({ where: { id: stageId } })
                )?.order,
              },
            },
            orderBy: { order: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  if (!stage) {
    throw new AppError('Stage not found', 'NOT_FOUND', 404);
  }

  if (fileId) {
    const file = stage.files.find((f) => f.id === fileId);
    if (!file) {
      throw new AppError('File not found', 'NOT_FOUND', 404);
    }

    let fileContent = '';
    try {
      fileContent = await fs.readFile(file.filePath, 'utf-8');
    } catch (e) {
      fileContent = 'Unable to read file content';
    }

    const result = await analyzeFile(file.fileName, fileContent);
    sendSuccess(res, result);
  } else {
    const previousStage = stage.phase.stages[0];
    const result = await analyzeStage(
      stage.name,
      stage.description,
      stage.lawTextContent,
      previousStage?.lawTextContent || null
    );
    sendSuccess(res, result);
  }
});

/**
 * Upload law PDF for a stage and extract text content
 */
export const uploadLawPdf = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;
  const file = req.file;

  if (!file) {
    throw new AppError('No file uploaded', 'BAD_REQUEST', 400);
  }

  if (file.mimetype !== 'application/pdf') {
    // Clean up uploaded file
    await fs.unlink(file.path).catch(() => {});
    throw new AppError('Only PDF files are allowed', 'BAD_REQUEST', 400);
  }

  // Extract text from PDF
  let extractedText = '';
  try {
    const pdfData = await extractTextFromPdf(file.path);
    extractedText = pdfData.text;
  } catch (error) {
    console.error('Failed to extract text from PDF:', error);
    // Continue without extracted text
  }

  // Update stage with PDF info and extracted text
  const stage = await prisma.stage.update({
    where: { id: stageId },
    data: {
      lawPdfPath: file.path,
      lawPdfName: file.originalname,
      lawTextContent: extractedText || null,
    },
  });

  sendSuccess(res, {
    stage,
    extractedTextLength: extractedText.length,
  });
});

/**
 * Download law PDF for a stage
 */
export const downloadLawPdf = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
  });

  if (!stage || !stage.lawPdfPath) {
    throw new AppError('Law PDF not found', 'NOT_FOUND', 404);
  }

  try {
    await fs.access(stage.lawPdfPath);
  } catch {
    throw new AppError('Law PDF file not found on disk', 'NOT_FOUND', 404);
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${stage.lawPdfName || 'law.pdf'}"`
  );
  res.sendFile(path.resolve(stage.lawPdfPath));
});

/**
 * Delete law PDF from a stage
 */
export const deleteLawPdf = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
  });

  if (!stage) {
    throw new AppError('Stage not found', 'NOT_FOUND', 404);
  }

  if (stage.lawPdfPath) {
    try {
      await fs.unlink(stage.lawPdfPath);
    } catch (e) {
      console.error('Failed to delete PDF file:', e);
    }
  }

  await prisma.stage.update({
    where: { id: stageId },
    data: {
      lawPdfPath: null,
      lawPdfName: null,
      lawTextContent: null,
    },
  });

  sendSuccess(res, { success: true });
});

/**
 * Analyze diff content using AI
 */
export const analyzeDiffHandler = asyncHandler(async (req: Request, res: Response) => {
  const { diffContent, sourceStage, targetStage } = req.body as {
    diffContent: string;
    sourceStage: string;
    targetStage: string;
  };

  if (!diffContent) {
    throw new AppError('Diff content is required', 'BAD_REQUEST', 400);
  }

  const result = await analyzeDiff(
    diffContent,
    sourceStage || 'Wersja źródłowa',
    targetStage || 'Wersja docelowa'
  );

  sendSuccess(res, result);
});
