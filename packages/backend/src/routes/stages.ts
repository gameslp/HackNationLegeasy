import { Router } from 'express';
import {
  getStages,
  getStageById,
  createStage,
  updateStage,
  deleteStage,
  analyzeStageHandler,
  uploadLawPdf,
  downloadLawPdf,
  deleteLawPdf,
} from '../controllers/stagesController';
import { getDiscussions, createDiscussion } from '../controllers/discussionsController';
import { uploadFile, downloadFile, deleteFile } from '../controllers/filesController';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';
import {
  CreateStageRequestSchema,
  UpdateStageRequestSchema,
  CreateDiscussionRequestSchema,
  AnalyzeRequestSchema,
} from '@repo/validation';

const router = Router({ mergeParams: true });

// Stages
router.get('/', getStages);
router.post('/', validate(CreateStageRequestSchema, 'body'), createStage);
router.get('/:stageId', getStageById);
router.put('/:stageId', validate(UpdateStageRequestSchema, 'body'), updateStage);
router.delete('/:stageId', deleteStage);

// AI Analysis
router.post('/:stageId/analyze', validate(AnalyzeRequestSchema, 'body'), analyzeStageHandler);

// Law PDF (main law document for stage)
router.post('/:stageId/law-pdf', upload.single('file'), uploadLawPdf);
router.get('/:stageId/law-pdf', downloadLawPdf);
router.delete('/:stageId/law-pdf', deleteLawPdf);

// Files (additional related documents)
router.post('/:stageId/files', upload.single('file'), uploadFile);
router.get('/:stageId/files/:fileId', downloadFile);
router.delete('/:stageId/files/:fileId', deleteFile);

// Discussions
router.get('/:stageId/discussions', getDiscussions);
router.post(
  '/:stageId/discussions',
  validate(CreateDiscussionRequestSchema, 'body'),
  createDiscussion
);

export default router;
