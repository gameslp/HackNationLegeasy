import { Router } from 'express';
import {
  getStats,
  getRecentStage,
  getAllPhases,
  getAllStages,
  getPhaseName,
  scanLinksForPhase,
} from '../controllers/adminController';
import { validate } from '../middleware/validate';
import { PhaseIdParamsSchema, ScanLinksRequestSchema } from '@repo/validation';

const router = Router();

router.get('/stats', getStats);
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
