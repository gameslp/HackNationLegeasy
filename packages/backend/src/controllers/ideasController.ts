import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess, sendError } from '../middleware/response';
import { IdeaArea, IdeaStatus, IdeaStage, RespondentType } from '@prisma/client';
import { summarizeIdeaOpinions } from '../services/aiService';

// GET /api/ideas - Lista pomysłów z filtrami
export const getIdeas = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    area,
    status,
    stage,
    sort = 'newest',
  } = req.query;

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search as string } },
      { shortDescription: { contains: search as string } },
      { ministry: { contains: search as string } },
    ];
  }

  if (area && area !== '') {
    where.area = area as IdeaArea;
  }

  if (status && status !== '') {
    where.status = status as IdeaStatus;
  }

  if (stage && stage !== '') {
    where.stage = stage as IdeaStage;
  }

  let orderBy: any = { publishDate: 'desc' };
  if (sort === 'deadline') {
    orderBy = { opinionDeadline: 'asc' };
  } else if (sort === 'oldest') {
    orderBy = { publishDate: 'asc' };
  }

  const ideas = await prisma.idea.findMany({
    where,
    orderBy,
    include: {
      _count: {
        select: {
          opinions: true,
          surveyResponses: true,
        },
      },
    },
  });

  // Oblicz statystyki dla każdego pomysłu
  const ideasWithStats = ideas.map((idea) => ({
    ...idea,
    totalOpinions: idea._count.opinions,
    totalSurveys: idea._count.surveyResponses,
  }));

  sendSuccess(res, { ideas: ideasWithStats, total: ideas.length });
});

// GET /api/ideas/:id - Szczegóły pomysłu
export const getIdeaById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
      timeline: {
        orderBy: { order: 'asc' },
      },
      attachments: {
        orderBy: { createdAt: 'desc' },
      },
      law: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          opinions: true,
          surveyResponses: true,
        },
      },
    },
  });

  if (!idea) {
    return sendError(res, 'Pomysł nie został znaleziony', 'NOT_FOUND', 404);
  }

  sendSuccess(res, idea);
});

// GET /api/ideas/:id/stats - Statystyki pomysłu
export const getIdeaStats = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const idea = await prisma.idea.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!idea) {
    return sendError(res, 'Pomysł nie został znaleziony', 'NOT_FOUND', 404);
  }

  // Pobierz odpowiedzi z ankiety
  const surveyResponses = await prisma.ideaSurveyResponse.findMany({
    where: { ideaId: id },
    select: {
      support: true,
      importance: true,
    },
  });

  // Oblicz statystyki poparcia
  const supportCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const importanceCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  surveyResponses.forEach((r) => {
    if (r.support >= 1 && r.support <= 4) {
      supportCounts[r.support as keyof typeof supportCounts]++;
    }
    if (r.importance >= 1 && r.importance <= 5) {
      importanceCounts[r.importance as keyof typeof importanceCounts]++;
    }
  });

  const totalSurveys = surveyResponses.length;

  // Oblicz procenty poparcia
  const supportPercentages = totalSurveys > 0 ? {
    against: Math.round((supportCounts[1] / totalSurveys) * 100),
    ratherAgainst: Math.round((supportCounts[2] / totalSurveys) * 100),
    ratherFor: Math.round((supportCounts[3] / totalSurveys) * 100),
    for: Math.round((supportCounts[4] / totalSurveys) * 100),
  } : { against: 0, ratherAgainst: 0, ratherFor: 0, for: 0 };

  // Średnia ważność
  const avgImportance = totalSurveys > 0
    ? surveyResponses.reduce((sum, r) => sum + r.importance, 0) / totalSurveys
    : 0;

  // Pobierz statystyki opinii według typu respondenta
  const opinionsByType = await prisma.ideaOpinion.groupBy({
    by: ['respondentType'],
    where: { ideaId: id },
    _count: true,
  });

  const opinionCounts: Record<string, number> = {
    CITIZEN: 0,
    NGO: 0,
    COMPANY: 0,
    EXPERT: 0,
  };

  opinionsByType.forEach((o) => {
    opinionCounts[o.respondentType] = o._count;
  });

  const totalOpinions = Object.values(opinionCounts).reduce((a, b) => a + b, 0);

  sendSuccess(res, {
    survey: {
      total: totalSurveys,
      supportCounts,
      supportPercentages,
      importanceCounts,
      avgImportance: Math.round(avgImportance * 10) / 10,
    },
    opinions: {
      total: totalOpinions,
      byType: opinionCounts,
    },
  });
});

// POST /api/ideas/:id/survey - Głosowanie w ankiecie
export const submitSurvey = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, email, support, importance } = req.body;

  // Walidacja
  if (!firstName || !lastName || !email) {
    return sendError(res, 'Imię, nazwisko i email są wymagane', 'VALIDATION_ERROR', 400);
  }

  if (!support || support < 1 || support > 4) {
    return sendError(res, 'Nieprawidłowa wartość poparcia (1-4)', 'VALIDATION_ERROR', 400);
  }

  if (!importance || importance < 1 || importance > 5) {
    return sendError(res, 'Nieprawidłowa wartość ważności (1-5)', 'VALIDATION_ERROR', 400);
  }

  const idea = await prisma.idea.findUnique({
    where: { id },
    select: { id: true, status: true, opinionDeadline: true },
  });

  if (!idea) {
    return sendError(res, 'Pomysł nie został znaleziony', 'NOT_FOUND', 404);
  }

  // Sprawdź czy można głosować - tylko status COLLECTING
  if (idea.status !== 'COLLECTING') {
    if (idea.status === 'NEW') {
      return sendError(res, 'Zbieranie opinii dla tego pomysłu jeszcze się nie rozpoczęło', 'NOT_STARTED', 400);
    }
    return sendError(res, 'Zbieranie opinii dla tego pomysłu zostało zakończone', 'CLOSED', 400);
  }

  if (idea.opinionDeadline && new Date() > idea.opinionDeadline) {
    return sendError(res, 'Termin zgłaszania opinii minął', 'DEADLINE_PASSED', 400);
  }

  // Sprawdź czy ten email już głosował
  const existingVote = await prisma.ideaSurveyResponse.findFirst({
    where: { ideaId: id, email },
  });

  if (existingVote) {
    return sendError(res, 'Ten adres email już oddał głos w ankiecie', 'ALREADY_VOTED', 400);
  }

  const surveyResponse = await prisma.ideaSurveyResponse.create({
    data: {
      ideaId: id,
      firstName,
      lastName,
      email,
      support,
      importance,
    },
  });

  sendSuccess(res, surveyResponse, 201);
});

// POST /api/ideas/:id/opinion - Dodanie opinii
export const submitOpinion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    email,
    respondentType = 'CITIZEN',
    organization,
    answers,
  } = req.body;

  // Walidacja
  if (!firstName || !lastName || !email) {
    return sendError(res, 'Imię, nazwisko i email są wymagane', 'VALIDATION_ERROR', 400);
  }

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      questions: {
        where: { required: true },
        select: { id: true },
      },
    },
  });

  if (!idea) {
    return sendError(res, 'Pomysł nie został znaleziony', 'NOT_FOUND', 404);
  }

  // Sprawdź czy można dodawać opinie - tylko status COLLECTING
  if (idea.status !== 'COLLECTING') {
    if (idea.status === 'NEW') {
      return sendError(res, 'Zbieranie opinii dla tego pomysłu jeszcze się nie rozpoczęło', 'NOT_STARTED', 400);
    }
    return sendError(res, 'Zbieranie opinii dla tego pomysłu zostało zakończone', 'CLOSED', 400);
  }

  if (idea.opinionDeadline && new Date() > idea.opinionDeadline) {
    return sendError(res, 'Termin zgłaszania opinii minął', 'DEADLINE_PASSED', 400);
  }

  // Walidacja wymaganych pytań
  const requiredQuestionIds = idea.questions.map((q) => q.id);
  if (answers && requiredQuestionIds.length > 0) {
    const answeredQuestionIds = Object.keys(answers);
    const missingRequired = requiredQuestionIds.filter(
      (qId) => !answeredQuestionIds.includes(qId) || !answers[qId]
    );
    if (missingRequired.length > 0) {
      return sendError(res, 'Nie odpowiedziano na wszystkie wymagane pytania', 'VALIDATION_ERROR', 400);
    }
  }

  // Utwórz opinię z odpowiedziami
  const opinion = await prisma.ideaOpinion.create({
    data: {
      ideaId: id,
      firstName,
      lastName,
      email,
      respondentType: respondentType as RespondentType,
      organization,
      answers: answers
        ? {
            create: Object.entries(answers).map(([questionId, answer]) => ({
              questionId,
              answer: answer as string,
            })),
          }
        : undefined,
    },
    include: {
      answers: true,
    },
  });

  sendSuccess(res, opinion, 201);
});

// ========================================
// ADMIN ENDPOINTS
// ========================================

// POST /api/admin/ideas - Utworzenie pomysłu
export const createIdea = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    shortDescription,
    ministry,
    area,
    status = 'NEW',
    stage = 'IDEA',
    problemDescription,
    proposedSolutions = [],
    opinionDeadline,
    questions = [],
    timeline = [],
  } = req.body;

  // Walidacja
  if (!title || !shortDescription || !ministry || !area || !problemDescription) {
    return sendError(res, 'Brakuje wymaganych pól', 'VALIDATION_ERROR', 400);
  }

  const idea = await prisma.idea.create({
    data: {
      title,
      shortDescription,
      ministry,
      area: area as IdeaArea,
      status: status as IdeaStatus,
      stage: stage as IdeaStage,
      problemDescription,
      proposedSolutions,
      opinionDeadline: opinionDeadline ? new Date(opinionDeadline) : null,
      questions: questions.length > 0
        ? {
            create: questions.map((q: any, index: number) => ({
              question: q.question,
              order: index + 1,
              required: q.required || false,
            })),
          }
        : undefined,
      timeline: timeline.length > 0
        ? {
            create: timeline.map((t: any, index: number) => ({
              title: t.title,
              description: t.description,
              date: new Date(t.date),
              order: index + 1,
            })),
          }
        : undefined,
    },
    include: {
      questions: true,
      timeline: true,
    },
  });

  sendSuccess(res, idea, 201);
});

// PUT /api/admin/ideas/:id - Edycja pomysłu
export const updateIdea = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    shortDescription,
    ministry,
    area,
    status,
    stage,
    problemDescription,
    proposedSolutions,
    opinionDeadline,
    closureReason,
    aiSummaryPublic,
  } = req.body;

  const existingIdea = await prisma.idea.findUnique({ where: { id } });

  if (!existingIdea) {
    return sendError(res, 'Pomysł nie został znaleziony', 'NOT_FOUND', 404);
  }

  const idea = await prisma.idea.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(shortDescription && { shortDescription }),
      ...(ministry && { ministry }),
      ...(area && { area: area as IdeaArea }),
      ...(status && { status: status as IdeaStatus }),
      ...(stage && { stage: stage as IdeaStage }),
      ...(problemDescription && { problemDescription }),
      ...(proposedSolutions && { proposedSolutions }),
      ...(opinionDeadline !== undefined && {
        opinionDeadline: opinionDeadline ? new Date(opinionDeadline) : null,
      }),
      ...(closureReason !== undefined && { closureReason }),
      ...(aiSummaryPublic !== undefined && { aiSummaryPublic }),
    },
    include: {
      questions: true,
      timeline: true,
      attachments: true,
    },
  });

  sendSuccess(res, idea);
});

// PUT /api/admin/ideas/:id/status - Zmiana statusu
export const updateIdeaStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, closureReason } = req.body;

  if (!status) {
    return sendError(res, 'Status jest wymagany', 'VALIDATION_ERROR', 400);
  }

  const existingIdea = await prisma.idea.findUnique({ where: { id } });

  if (!existingIdea) {
    return sendError(res, 'Pomysł nie został znaleziony', 'NOT_FOUND', 404);
  }

  const updateData: any = {
    status: status as IdeaStatus,
  };

  if (status === 'CLOSED' || status === 'ARCHIVED') {
    updateData.closedDate = new Date();
    if (closureReason) {
      updateData.closureReason = closureReason;
    }
  }

  const idea = await prisma.idea.update({
    where: { id },
    data: updateData,
  });

  sendSuccess(res, idea);
});

// POST /api/admin/ideas/:id/questions - Dodanie pytania
export const addQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { question, required = false } = req.body;

  if (!question) {
    return sendError(res, 'Treść pytania jest wymagana', 'VALIDATION_ERROR', 400);
  }

  const existingIdea = await prisma.idea.findUnique({ where: { id } });

  if (!existingIdea) {
    return sendError(res, 'Pomysł nie został znaleziony', 'NOT_FOUND', 404);
  }

  // Pobierz maksymalny order
  const maxOrderQuestion = await prisma.ideaQuestion.findFirst({
    where: { ideaId: id },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const newQuestion = await prisma.ideaQuestion.create({
    data: {
      ideaId: id,
      question,
      required,
      order: (maxOrderQuestion?.order || 0) + 1,
    },
  });

  sendSuccess(res, newQuestion, 201);
});

// DELETE /api/admin/ideas/:id/questions/:questionId - Usunięcie pytania
export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { id, questionId } = req.params;

  const question = await prisma.ideaQuestion.findFirst({
    where: { id: questionId, ideaId: id },
  });

  if (!question) {
    return sendError(res, 'Pytanie nie zostało znalezione', 'NOT_FOUND', 404);
  }

  await prisma.ideaQuestion.delete({ where: { id: questionId } });

  sendSuccess(res, { message: 'Pytanie zostało usunięte' });
});

// POST /api/admin/ideas/:id/timeline - Dodanie wydarzenia do timeline
export const addTimelineEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, date } = req.body;

  if (!title || !date) {
    return sendError(res, 'Tytuł i data są wymagane', 'VALIDATION_ERROR', 400);
  }

  const existingIdea = await prisma.idea.findUnique({ where: { id } });

  if (!existingIdea) {
    return sendError(res, 'Pomysł nie został znaleziony', 'NOT_FOUND', 404);
  }

  // Pobierz maksymalny order
  const maxOrderEvent = await prisma.ideaTimelineEvent.findFirst({
    where: { ideaId: id },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const event = await prisma.ideaTimelineEvent.create({
    data: {
      ideaId: id,
      title,
      description,
      date: new Date(date),
      order: (maxOrderEvent?.order || 0) + 1,
    },
  });

  sendSuccess(res, event, 201);
});

// GET /api/admin/ideas/:id/opinions - Lista opinii dla admina
export const getIdeaOpinions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const opinions = await prisma.ideaOpinion.findMany({
    where: { ideaId: id },
    include: {
      answers: {
        include: {
          question: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  sendSuccess(res, { opinions, total: opinions.length });
});

// GET /api/admin/ideas/:id/surveys - Lista odpowiedzi z ankiety dla admina
export const getIdeaSurveys = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const surveys = await prisma.ideaSurveyResponse.findMany({
    where: { ideaId: id },
    orderBy: { createdAt: 'desc' },
  });

  sendSuccess(res, { surveys, total: surveys.length });
});

// POST /api/admin/ideas/:id/ai-summary - Generowanie AI podsumowania
export const generateAiSummary = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const idea = await prisma.idea.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      shortDescription: true,
    },
  });

  if (!idea) {
    return sendError(res, 'Pomysł nie został znaleziony', 'NOT_FOUND', 404);
  }

  // Pobierz statystyki ankiety
  const surveyResponses = await prisma.ideaSurveyResponse.findMany({
    where: { ideaId: id },
    select: { support: true, importance: true },
  });

  const totalSurveys = surveyResponses.length;
  let supportFor = 0;
  let supportAgainst = 0;
  let totalImportance = 0;

  surveyResponses.forEach((r) => {
    if (r.support >= 3) supportFor++;
    else supportAgainst++;
    totalImportance += r.importance;
  });

  const surveyStats = {
    total: totalSurveys,
    supportFor: totalSurveys > 0 ? Math.round((supportFor / totalSurveys) * 100) : 0,
    supportAgainst: totalSurveys > 0 ? Math.round((supportAgainst / totalSurveys) * 100) : 0,
    avgImportance: totalSurveys > 0 ? Math.round((totalImportance / totalSurveys) * 10) / 10 : 0,
  };

  // Pobierz opinie z odpowiedziami
  const opinions = await prisma.ideaOpinion.findMany({
    where: { ideaId: id },
    include: {
      answers: {
        include: {
          question: true,
        },
      },
    },
  });

  const formattedOpinions = opinions.map((op) => ({
    respondentType: op.respondentType,
    answers: op.answers.map((a) => ({
      question: a.question?.question || '',
      answer: a.answer,
    })),
  }));

  // Wygeneruj podsumowanie AI
  const aiResult = await summarizeIdeaOpinions(
    idea.title,
    idea.shortDescription,
    surveyStats,
    formattedOpinions
  );

  // Zapisz podsumowanie w bazie
  const summaryText = `${aiResult.summary}

**Najczęstsze obawy:**
${aiResult.mainConcerns.map((c) => `• ${c}`).join('\n')}

**Najczęściej wskazywane korzyści:**
${aiResult.mainBenefits.map((b) => `• ${b}`).join('\n')}

**Rekomendacje:**
${aiResult.recommendations.map((r) => `• ${r}`).join('\n')}`;

  await prisma.idea.update({
    where: { id },
    data: {
      aiSummary: summaryText,
      aiSummaryDate: new Date(),
    },
  });

  sendSuccess(res, {
    summary: summaryText,
    details: aiResult,
  });
});

// POST /api/admin/ideas/:id/attachments - Upload plików do pomysłu
export const uploadIdeaAttachment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingIdea = await prisma.idea.findUnique({ where: { id } });

  if (!existingIdea) {
    return sendError(res, 'Pomysł nie został znaleziony', 'NOT_FOUND', 404);
  }

  if (!req.file) {
    return sendError(res, 'Nie przesłano pliku', 'NO_FILE', 400);
  }

  const attachment = await prisma.ideaAttachment.create({
    data: {
      ideaId: id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
  });

  sendSuccess(res, attachment, 201);
});

// DELETE /api/admin/ideas/:id/attachments/:attachmentId - Usunięcie pliku
export const deleteIdeaAttachment = asyncHandler(async (req: Request, res: Response) => {
  const { id, attachmentId } = req.params;

  const attachment = await prisma.ideaAttachment.findFirst({
    where: { id: attachmentId, ideaId: id },
  });

  if (!attachment) {
    return sendError(res, 'Załącznik nie został znaleziony', 'NOT_FOUND', 404);
  }

  // Usuń plik z dysku
  const fs = await import('fs/promises');
  try {
    await fs.unlink(attachment.filePath);
  } catch (err) {
    // Plik może nie istnieć - kontynuuj
  }

  await prisma.ideaAttachment.delete({ where: { id: attachmentId } });

  sendSuccess(res, { message: 'Załącznik został usunięty' });
});

// GET /api/ideas/:id/attachments/:attachmentId/download - Pobieranie pliku
export const downloadIdeaAttachment = asyncHandler(async (req: Request, res: Response) => {
  const { id, attachmentId } = req.params;

  const attachment = await prisma.ideaAttachment.findFirst({
    where: { id: attachmentId, ideaId: id },
  });

  if (!attachment) {
    return sendError(res, 'Załącznik nie został znaleziony', 'NOT_FOUND', 404);
  }

  res.download(attachment.filePath, attachment.fileName);
});

// POST /api/admin/ideas/:id/convert-to-law - Przekształcenie w ustawę
export const convertToLaw = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { lawName, lawDescription, lawAuthor } = req.body;

  const idea = await prisma.idea.findUnique({
    where: { id },
  });

  if (!idea) {
    return sendError(res, 'Pomysł nie został znaleziony', 'NOT_FOUND', 404);
  }

  if (idea.lawId) {
    return sendError(res, 'Pomysł już został przekształcony w ustawę', 'ALREADY_CONVERTED', 400);
  }

  // Utwórz nową ustawę z fazą PRECONSULTATION powiązaną bezpośrednio z pomysłem
  // Faza PRECONSULTATION nie wymaga etapów - dane są pobierane z modelu Idea
  const law = await prisma.law.create({
    data: {
      name: lawName || idea.title,
      author: lawAuthor || idea.ministry,
      description: lawDescription || idea.shortDescription,
      startDate: new Date(),
      phases: {
        create: {
          type: 'PRECONSULTATION',
          startDate: idea.publishDate,
          endDate: new Date(),
          order: 1,
          ideaId: id, // Powiązanie fazy bezpośrednio z pomysłem
        },
      },
    },
    include: {
      phases: {
        include: {
          idea: true,
        },
      },
    },
  });

  // Zaktualizuj pomysł
  await prisma.idea.update({
    where: { id },
    data: {
      lawId: law.id,
      status: 'CONVERTED',
      closedDate: new Date(),
    },
  });

  sendSuccess(res, { law, ideaId: id });
});
