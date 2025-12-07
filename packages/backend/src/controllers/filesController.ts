import { Request, Response } from 'express';
import { prisma, FileType } from '@repo/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../middleware/response';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import type { ImportFileFromLinkRequest } from '@repo/validation';

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

export const importFileFromLink = asyncHandler(async (req: Request, res: Response) => {
  const { stageId } = req.params;
  const { url, fileType, name, stageName } = req.body as ImportFileFromLinkRequest;

  const response = await fetch(url);
  if (!response.ok) {
    throw new AppError(
      `Failed to fetch file from link (status ${response.status})`,
      'EXTERNAL_FETCH_ERROR',
      502
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get('content-type') || 'application/octet-stream';

  const resolvedName =
    name?.trim() ||
    parseContentDisposition(response.headers.get('content-disposition')) ||
    decodeURIComponent(url.split('/').pop() || '') ||
    'dokument';

  const extFromName = path.extname(resolvedName);
  const extFromContentType = mapContentTypeToExt(contentType);
  const ext = extFromName || extFromContentType || '';

  const uploadsDir = path.join(process.cwd(), '..', '..', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  const uniqueName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const filePath = path.join(uploadsDir, uniqueName);

  await fs.writeFile(filePath, buffer);

  const stageFile = await prisma.stageFile.create({
    data: {
      stageId,
      fileName: resolvedName || uniqueName,
      filePath,
      fileType: (fileType as FileType) || FileType.RELATED,
      mimeType: contentType,
      size: buffer.length,
    },
  });

  sendSuccess(res, { stageFile, stageName: stageName || null }, 201);
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

function parseContentDisposition(header: string | null) {
  if (!header) return null;
  const match = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(header);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

function mapContentTypeToExt(contentType: string) {
  const map: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      '.docx',
    'text/plain': '.txt',
  };
  return map[contentType] || '';
}
