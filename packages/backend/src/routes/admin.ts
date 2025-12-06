import { Router } from 'express';
import { getStats, getRecentStage, getAllPhases, getAllStages } from '../controllers/adminController';

const router = Router();

router.get('/stats', getStats);
router.get('/recent-stage', getRecentStage);
router.get('/all-phases', getAllPhases);
router.get('/all-stages', getAllStages);

export default router;
