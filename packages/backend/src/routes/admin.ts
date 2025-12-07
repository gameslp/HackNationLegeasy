import { Router } from 'express';
import { getStats } from '../controllers/adminController';
import {
  generateStageImpactAnalysis,
  updateStageImpactAnalysis,
  toggleImpactPublish,
  getAdminStageImpactAnalysis,
} from '../controllers/impactController';

const router = Router();

router.get('/stats', getStats);

// Impact Analysis admin routes
router.get('/stages/:stageId/impact', getAdminStageImpactAnalysis);
router.post('/stages/:stageId/impact/generate', generateStageImpactAnalysis);
router.put('/stages/:stageId/impact', updateStageImpactAnalysis);
router.post('/stages/:stageId/impact/publish', toggleImpactPublish);

export default router;
