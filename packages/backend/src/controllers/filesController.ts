import { Request, Response } from 'express';
import { prisma, FileType } from '@repo/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../middleware/response';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs/promises';
import path from 'path';

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;
  const file = req.file;
  const { fileType } = req.body;

  if (!file) {
    throw new AppError('No file uploaded', 'BAD_REQUEST', 400);
  }

  const stageFile = await prisma.stageFile.create({
    data: {
      stageId,
      fileName: file.originalname,
      filePath: file.path,
      fileType: fileType as FileType,
      mimeType: file.mimetype,
      size: file.size,
    },
  });

  sendSuccess(res, stageFile, 201);
});

export const downloadFile = asyncHandler(async (req: Request, res: Response) => {
  const { fileId } = req.params;

  const file = await prisma.stageFile.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new AppError('File not found', 'NOT_FOUND', 404);
  }

  try {
    await fs.access(file.filePath);
  } catch {
    throw new AppError('File not found on disk', 'NOT_FOUND', 404);
  }

  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
  res.sendFile(path.resolve(file.filePath));
});

export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const { fileId } = req.params;

  const file = await prisma.stageFile.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new AppError('File not found', 'NOT_FOUND', 404);
  }

  try {
    await fs.unlink(file.filePath);
  } catch (e) {
    console.error(`Failed to delete file from disk: ${file.filePath}`);
  }

  await prisma.stageFile.delete({
    where: { id: fileId },
  });

  sendSuccess(res, { success: true });
});
