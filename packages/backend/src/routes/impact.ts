import { Router } from 'express';
import {
  getLawImpactAnalyses,
  getStageImpactAnalysis,
  compareImpactAnalyses,
} from '../controllers/impactController';

const router = Router({ mergeParams: true });

// Public routes
// GET /api/laws/:lawId/impact - Get all impact analyses for a law
router.get('/', getLawImpactAnalyses);

// GET /api/laws/:lawId/impact/compare - Compare two stage analyses
router.get('/compare', compareImpactAnalyses);

export default router;
