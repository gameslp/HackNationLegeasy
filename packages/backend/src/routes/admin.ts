import { Router } from 'express';
import {
  getStats,
  getRecentStage,
  getAllPhases,
  getAllStages,
  getPhaseName,
  scanLinksForPhase,
  scrapeRclStage,
  scrapeRclProject,
} from '../controllers/adminController';
import {
  generateStageImpactAnalysis,
  updateStageImpactAnalysis,
  toggleImpactPublish,
  getAdminStageImpactAnalysis,
} from '../controllers/impactController';
import {
  importSejmProcess,
  previewSejmImport,
} from '../controllers/sejmImportController';
import { validate } from '../middleware/validate';
import { PhaseIdParamsSchema, ScanLinksRequestSchema, ImportSejmProcessSchema, ScrapeRclStageRequestSchema, ScrapeRclProjectRequestSchema} from '@repo/validation';

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
router.post(
  '/scrape-rcl-stage',
  validate(ScrapeRclStageRequestSchema, 'body'),
  scrapeRclStage
);
router.post(
  '/scrape-rcl-project',
  validate(ScrapeRclProjectRequestSchema, 'body'),
  scrapeRclProject
);

// Sejm Import
router.post(
  '/laws/import/preview',
  validate(ImportSejmProcessSchema, 'body'),
  previewSejmImport
);
router.post(
  '/laws/import',
  validate(ImportSejmProcessSchema, 'body'),
  importSejmProcess
);

export default router;
