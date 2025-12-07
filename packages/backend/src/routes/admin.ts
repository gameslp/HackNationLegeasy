import { Router } from 'express';
import {
  getStats,
  getRecentStage,
  getAllPhases,
  getAllStages,
  getPhaseName,
  scanLinksForPhase,
} from '../controllers/adminController';
import {
  generateStageImpactAnalysis,
  updateStageImpactAnalysis,
  toggleImpactPublish,
  getAdminStageImpactAnalysis,
} from '../controllers/impactController';
import { validate } from '../middleware/validate';
import { PhaseIdParamsSchema, ScanLinksRequestSchema } from '@repo/validation';

const router = Router();

router.get('/stats', getStats);

// Impact Analysis admin routes
router.get('/stages/:stageId/impact', getAdminStageImpactAnalysis);
router.post('/stages/:stageId/impact/generate', generateStageImpactAnalysis);
router.put('/stages/:stageId/impact', updateStageImpactAnalysis);
router.post('/stages/:stageId/impact/publish', toggleImpactPublish);
router.get('/recent-stage', getRecentStage);
router.get('/all-phases', getAllPhases);
router.get('/all-stages', getAllStages);
router.get(
  '/phases/:phaseId/name',
  validate(PhaseIdParamsSchema, 'params'),
  getPhaseName
);
router.post(
  '/scan-links',
  validate(ScanLinksRequestSchema, 'body'),
  scanLinksForPhase
);

export default router;
