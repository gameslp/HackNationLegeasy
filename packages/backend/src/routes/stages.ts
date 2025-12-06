import { Router } from 'express';
import {
  getStages,
  getStageById,
  createStage,
  updateStage,
  deleteStage,
  analyzeStageHandler,
} from '../controllers/stagesController.js';
import { getDiscussions, createDiscussion } from '../controllers/discussionsController.js';
import { uploadFile, downloadFile, deleteFile } from '../controllers/filesController.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
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

// Files
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
