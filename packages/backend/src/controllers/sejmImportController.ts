import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import type { Prisma } from '@repo/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess, sendError } from '../middleware/response';
import { AppError } from '../middleware/errorHandler';
import { sejmApiService } from '../services/sejmApiService';
import * as path from 'path';

/**
 * Importuje proces legislacyjny z Sejm API
 * POST /api/admin/laws/import
 */
export const importSejmProcess = asyncHandler(async (req: Request, res: Response) => {
  const { term, processNumber } = req.body;

  if (!term || !processNumber) {
    throw new AppError('Term and processNumber are required', 'VALIDATION_ERROR', 400);
  }

  // Sprawdź czy proces już istnieje
  const existing = await prisma.law.findFirst({
    where: {
      term: Number(term),
      processNumber: String(processNumber),
    },
  });

  if (existing) {
    throw new AppError(
      `Law with term ${term} and processNumber ${processNumber} already exists`,
      'DUPLICATE_ERROR',
      409
    );
  }

  // Pobierz dane z Sejm API
  let processData;
  try {
    processData = await sejmApiService.fetchProcess(Number(term), String(processNumber));
  } catch (error) {
    throw new AppError(
      `Failed to fetch process from Sejm API: ${error}`,
      'SEJM_API_ERROR',
      400
    );
  }

  // Zmapuj etapy na fazy
  const mappedPhases = sejmApiService.mapProcessToPhases(processData);

  if (mappedPhases.length === 0) {
    throw new AppError('No phases found in the process', 'NO_DATA', 400);
  }

  // Przygotuj upload directory dla PDFów
  const uploadsDir = path.join(process.cwd(), '..', '..', 'uploads', 'sejm', `t${term}`);

  // Utwórz ustawę z fazami i etapami w transakcji
  const law = await prisma.$transaction(async (tx) => {
    // Utwórz ustawę
    const createdLaw = await tx.law.create({
      data: {
        name: processData.title,
        author: 'Sejm RP', // Domyślny autor
        description: processData.titleFinal || processData.title,
        startDate: isNaN(new Date(processData.processStartDate).getTime()) ? new Date() : new Date(processData.processStartDate),
        publishDate: processData.closureDate ? new Date(processData.closureDate) : null,
        term: processData.term,
        processNumber: processData.number,
        eli: processData.ELI,
        passed: processData.passed,
      },
    });

    // Utwórz fazy i etapy
    for (const [phaseIdx, mappedPhase] of mappedPhases.entries()) {
      const createdPhase = await tx.phase.create({
        data: {
          lawId: createdLaw.id,
          type: mappedPhase.type,
          startDate: mappedPhase.startDate,
          endDate: mappedPhase.endDate,
          order: phaseIdx,
        },
      });

      // Utwórz etapy dla tej fazy
      for (const mappedStage of mappedPhase.stages) {
        const stageData: Prisma.StageCreateInput = {
          phase: {
            connect: { id: createdPhase.id },
          },
          name: mappedStage.name,
          date: mappedStage.date || mappedPhase.startDate,
          author: mappedStage.author,
          description: mappedStage.description,
          governmentLinks: mappedStage.governmentLinks,
          order: mappedStage.order,
        };

        const createdStage = await tx.stage.create({
          data: stageData,
        });

        // Pobierz PDF jeśli jest printNumber
        if (mappedStage.printNumber) {
          try {
            const pdfResult = await sejmApiService.downloadPrintPdf(
              processData.term,
              mappedStage.printNumber,
              uploadsDir
            );

            if (pdfResult) {
              // Zapisz informację o pliku PDF w bazie
              await tx.stageFile.create({
                data: {
                  stageId: createdStage.id,
                  fileName: pdfResult.fileName,
                  filePath: pdfResult.filePath,
                  fileType: 'LAW_PDF',
                  mimeType: 'application/pdf',
                  size: 0, // TODO: można dodać rozmiar pliku
                },
              });

              // Opcjonalnie: można tutaj dodać ekstrakcję tekstu z PDF
              // i zapisać go w lawTextContent dla diff
            }
          } catch (error) {
            console.error(`Failed to download PDF for print ${mappedStage.printNumber}:`, error);
            // Kontynuuj nawet jeśli PDF się nie pobierze
          }
        }
      }
    }

    return createdLaw;
  });

  // Pobierz utworzoną ustawę z relacjami
  const fullLaw = await prisma.law.findUnique({
    where: { id: law.id },
    include: {
      phases: {
        orderBy: { order: 'asc' },
        include: {
          stages: {
            orderBy: { order: 'asc' },
            include: {
              files: true,
            },
          },
        },
      },
    },
  });

  sendSuccess(res, fullLaw, 201);
});

/**
 * Podgląd importu bez zapisywania
 * POST /api/admin/laws/import/preview
 */
export const previewSejmImport = asyncHandler(async (req: Request, res: Response) => {
  const { term, processNumber } = req.body;

  if (!term || !processNumber) {
    throw new AppError('Term and processNumber are required', 'VALIDATION_ERROR', 400);
  }

  // Pobierz dane z Sejm API
  let processData;
  try {
    processData = await sejmApiService.fetchProcess(Number(term), String(processNumber));
  } catch (error) {
    throw new AppError(
      `Failed to fetch process from Sejm API: ${error}`,
      'SEJM_API_ERROR',
      400
    );
  }

  // Zmapuj etapy na fazy
  const mappedPhases = sejmApiService.mapProcessToPhases(processData);

  // Zwróć podgląd bez zapisywania
  sendSuccess(res, {
    law: {
      name: processData.title,
      author: 'Sejm RP',
      description: processData.titleFinal || processData.title,
      startDate: processData.processStartDate,
      publishDate: processData.closureDate,
      term: processData.term,
      processNumber: processData.number,
      eli: processData.ELI,
      passed: processData.passed,
    },
    phases: mappedPhases.map((phase) => ({
      type: phase.type,
      startDate: phase.startDate,
      endDate: phase.endDate,
      stagesCount: phase.stages.length,
      stages: phase.stages.map((stage) => ({
        name: stage.name,
        date: stage.date,
        author: stage.author,
        description: stage.description,
        hasPrint: !!stage.printNumber,
        printNumber: stage.printNumber,
      })),
    })),
    totalPhases: mappedPhases.length,
    totalStages: mappedPhases.reduce((sum, p) => sum + p.stages.length, 0),
  });
});
