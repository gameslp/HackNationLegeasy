import { Router } from 'express';
import {
  getIdeas,
  getIdeaById,
  getIdeaStats,
  submitSurvey,
  submitOpinion,
  createIdea,
  updateIdea,
  updateIdeaStatus,
  addQuestion,
  deleteQuestion,
  addTimelineEvent,
  getIdeaOpinions,
  getIdeaSurveys,
  generateAiSummary,
  convertToLaw,
  uploadIdeaAttachment,
  deleteIdeaAttachment,
  downloadIdeaAttachment,
} from '../controllers/ideasController';
import { upload } from '../middleware/upload';

const router = Router();

// ========================================
// PUBLIC ROUTES
// ========================================

// Lista pomysłów
router.get('/', getIdeas);

// Szczegóły pomysłu
router.get('/:id', getIdeaById);

// Statystyki pomysłu
router.get('/:id/stats', getIdeaStats);

// Głosowanie w ankiecie
router.post('/:id/survey', submitSurvey);

// Dodanie opinii
router.post('/:id/opinion', submitOpinion);

// ========================================
// ADMIN ROUTES
// ========================================

// Utworzenie pomysłu
router.post('/', createIdea);

// Edycja pomysłu
router.put('/:id', updateIdea);

// Zmiana statusu
router.put('/:id/status', updateIdeaStatus);

// Zarządzanie pytaniami
router.post('/:id/questions', addQuestion);
router.delete('/:id/questions/:questionId', deleteQuestion);

// Zarządzanie timeline
router.post('/:id/timeline', addTimelineEvent);

// Lista opinii dla admina
router.get('/:id/opinions', getIdeaOpinions);

// Lista odpowiedzi z ankiety dla admina
router.get('/:id/surveys', getIdeaSurveys);

// Generowanie AI podsumowania
router.post('/:id/ai-summary', generateAiSummary);

// Przekształcenie w ustawę
router.post('/:id/convert-to-law', convertToLaw);

// Zarządzanie załącznikami
router.post('/:id/attachments', upload.single('file'), uploadIdeaAttachment);
router.delete('/:id/attachments/:attachmentId', deleteIdeaAttachment);

// ========================================
// PUBLIC FILE DOWNLOAD
// ========================================
router.get('/:id/attachments/:attachmentId/download', downloadIdeaAttachment);

export default router;
