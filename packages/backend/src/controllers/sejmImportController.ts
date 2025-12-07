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
  const { term, processNumber, lawId } = req.body;

  if (!term || !processNumber) {
    throw new AppError('Term and processNumber are required', 'VALIDATION_ERROR', 400);
  }

  // Jeśli lawId jest podane, importuj do istniejącego procesu
  if (lawId) {
    const existingLaw = await prisma.law.findUnique({
      where: { id: lawId },
      include: {
        phases: {
          include: {
            stages: true,
          },
        },
      },
    });

    if (!existingLaw) {
      throw new AppError('Law not found', 'NOT_FOUND', 404);
    }

    if (existingLaw.term || existingLaw.processNumber) {
      throw new AppError(
        'Law already has Sejm data imported',
        'ALREADY_IMPORTED',
        400
      );
    }

    return importToExistingLaw(req, res, existingLaw);
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

        // Pobierz PDF z reportFile jeśli istnieje
        if (mappedStage.reportFile) {
          try {
            const pdfResult = await sejmApiService.downloadPdfFromUrl(
              mappedStage.reportFile,
              uploadsDir
            );

            if (pdfResult) {
              // Zapisz informację o pliku PDF w bazie
              await tx.stageFile.create({
                data: {
                  stageId: createdStage.id,
                  fileName: pdfResult.fileName,
                  filePath: pdfResult.filePath,
                  fileType: 'RELATED',
                  mimeType: 'application/pdf',
                  size: 0,
                },
              });
            }
          } catch (error) {
            console.error(`Failed to download reportFile from ${mappedStage.reportFile}:`, error);
            // Kontynuuj nawet jeśli PDF się nie pobierze
          }
        }
      }
    }

    // Pobierz PDF z ELI API jeśli proces jest zakończony i ma link eli-api
    const eliApiLink = processData.links.find((link) => link.rel === 'eli-api');
    if (eliApiLink && processData.passed) {
      try {
        const eliPdfResult = await sejmApiService.downloadEliPdf(eliApiLink.href, uploadsDir);

        if (eliPdfResult) {
          // Znajdź fazę JOURNAL lub ostatnią fazę
          const journalPhase = await tx.phase.findFirst({
            where: {
              lawId: createdLaw.id,
              type: 'JOURNAL',
            },
            include: {
              stages: {
                orderBy: { order: 'desc' },
                take: 1,
              },
            },
          });

          // Jeśli nie ma fazy JOURNAL, użyj ostatniej fazy
          let targetPhase = journalPhase;
          if (!targetPhase) {
            targetPhase = await tx.phase.findFirst({
              where: { lawId: createdLaw.id },
              orderBy: { order: 'desc' },
              include: {
                stages: {
                  orderBy: { order: 'desc' },
                  take: 1,
                },
              },
            });
          }

          if (targetPhase && targetPhase.stages.length > 0) {
            // Dodaj plik do ostatniego etapu w fazie
            await tx.stageFile.create({
              data: {
                stageId: targetPhase.stages[0].id,
                fileName: eliPdfResult.fileName,
                filePath: eliPdfResult.filePath,
                fileType: 'LAW_PDF',
                mimeType: 'application/pdf',
                size: 0,
              },
            });

            console.log(`Downloaded ELI PDF: ${eliPdfResult.title}`);
          }
        }
      } catch (error) {
        console.error(`Failed to download ELI PDF:`, error);
        // Kontynuuj nawet jeśli PDF się nie pobierze
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
        hasReportFile: !!stage.reportFile,
        reportFile: stage.reportFile,
      })),
    })),
    totalPhases: mappedPhases.length,
    totalStages: mappedPhases.reduce((sum, p) => sum + p.stages.length, 0),
  });
});

/**
 * Importuje dane z Sejm API do istniejącej ustawy
 */
async function importToExistingLaw(
  req: Request,
  res: Response,
  existingLaw: any
) {
  const { term, processNumber } = req.body;

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

  // Aktualizuj ustawę i dodaj fazy/etapy z Sejm API
  const law = await prisma.$transaction(async (tx) => {
    // Zaktualizuj podstawowe dane ustawy
    // Jeśli nazwa się różni, dodaj nazwę z Sejmu do opisu
    let updatedDescription = existingLaw.description;
    if (existingLaw.name !== processData.title) {
      updatedDescription = `${existingLaw.description}\n\n[Z Sejm API: ${processData.title}]`;
    }

    const updatedLaw = await tx.law.update({
      where: { id: existingLaw.id },
      data: {
        description: updatedDescription,
        publishDate: processData.closureDate ? new Date(processData.closureDate) : existingLaw.publishDate,
        term: processData.term,
        processNumber: processData.number,
        eli: processData.ELI,
        passed: processData.passed,
      },
    });

    // Utwórz fazy i etapy z Sejm API
    for (const [phaseIdx, mappedPhase] of mappedPhases.entries()) {
      // Sprawdź czy faza tego typu już istnieje
      let phase = existingLaw.phases.find((p: any) => p.type === mappedPhase.type);

      if (!phase) {
        // Utwórz nową fazę
        phase = await tx.phase.create({
          data: {
            lawId: updatedLaw.id,
            type: mappedPhase.type,
            startDate: mappedPhase.startDate,
            endDate: mappedPhase.endDate,
            order: existingLaw.phases.length + phaseIdx,
          },
        });
      } else {
        // Aktualizuj istniejącą fazę (daty)
        phase = await tx.phase.update({
          where: { id: phase.id },
          data: {
            startDate: mappedPhase.startDate < phase.startDate ? mappedPhase.startDate : phase.startDate,
            endDate: mappedPhase.endDate && (!phase.endDate || mappedPhase.endDate > phase.endDate)
              ? mappedPhase.endDate
              : phase.endDate,
          },
        });
      }

      // Utwórz etapy dla tej fazy
      const existingStagesCount = await tx.stage.count({
        where: { phaseId: phase.id },
      });

      for (const mappedStage of mappedPhase.stages) {
        const stageData: Prisma.StageCreateInput = {
          phase: {
            connect: { id: phase.id },
          },
          name: mappedStage.name,
          date: mappedStage.date || mappedPhase.startDate,
          author: mappedStage.author,
          description: mappedStage.description,
          governmentLinks: mappedStage.governmentLinks,
          order: existingStagesCount + mappedStage.order,
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
              await tx.stageFile.create({
                data: {
                  stageId: createdStage.id,
                  fileName: pdfResult.fileName,
                  filePath: pdfResult.filePath,
                  fileType: 'LAW_PDF',
                  mimeType: 'application/pdf',
                  size: 0,
                },
              });
            }
          } catch (error) {
            console.error(`Failed to download PDF for print ${mappedStage.printNumber}:`, error);
          }
        }

        // Pobierz PDF z reportFile jeśli istnieje
        if (mappedStage.reportFile) {
          try {
            const pdfResult = await sejmApiService.downloadPdfFromUrl(
              mappedStage.reportFile,
              uploadsDir
            );

            if (pdfResult) {
              await tx.stageFile.create({
                data: {
                  stageId: createdStage.id,
                  fileName: pdfResult.fileName,
                  filePath: pdfResult.filePath,
                  fileType: 'RELATED',
                  mimeType: 'application/pdf',
                  size: 0,
                },
              });
            }
          } catch (error) {
            console.error(`Failed to download reportFile from ${mappedStage.reportFile}:`, error);
          }
        }
      }
    }

    // Pobierz PDF z ELI API jeśli proces jest zakończony
    const eliApiLink = processData.links.find((link) => link.rel === 'eli-api');
    if (eliApiLink && processData.passed) {
      try {
        const eliPdfResult = await sejmApiService.downloadEliPdf(eliApiLink.href, uploadsDir);

        if (eliPdfResult) {
          const journalPhase = await tx.phase.findFirst({
            where: {
              lawId: updatedLaw.id,
              type: 'JOURNAL',
            },
            include: {
              stages: {
                orderBy: { order: 'desc' },
                take: 1,
              },
            },
          });

          let targetPhase = journalPhase;
          if (!targetPhase) {
            targetPhase = await tx.phase.findFirst({
              where: { lawId: updatedLaw.id },
              orderBy: { order: 'desc' },
              include: {
                stages: {
                  orderBy: { order: 'desc' },
                  take: 1,
                },
              },
            });
          }

          if (targetPhase && targetPhase.stages.length > 0) {
            await tx.stageFile.create({
              data: {
                stageId: targetPhase.stages[0].id,
                fileName: eliPdfResult.fileName,
                filePath: eliPdfResult.filePath,
                fileType: 'LAW_PDF',
                mimeType: 'application/pdf',
                size: 0,
              },
            });

            console.log(`Downloaded ELI PDF: ${eliPdfResult.title}`);
          }
        }
      } catch (error) {
        console.error(`Failed to download ELI PDF:`, error);
      }
    }

    return updatedLaw;
  });

  // Pobierz zaktualizowaną ustawę z relacjami
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

  sendSuccess(res, fullLaw, 200);
}
