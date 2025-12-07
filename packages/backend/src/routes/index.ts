import { Router } from 'express';
import lawsRouter from './laws';
import phasesRouter from './phases';
import stagesRouter from './stages';
import adminRouter from './admin';
import ideasRouter from './ideas';
import impactRouter from './impact';
import chatRouter from './chat';
import { getStageImpactAnalysis } from '../controllers/impactController';

const router = Router();

router.use('/laws', lawsRouter);
router.use('/laws/:lawId/phases', phasesRouter);
router.use('/laws/:lawId/phases/:phaseId/stages', stagesRouter);
router.use('/laws/:lawId/impact', impactRouter);
router.get('/stages/:stageId/impact', getStageImpactAnalysis);
router.use('/admin', adminRouter);
router.use('/ideas', ideasRouter);
router.use('/chat', chatRouter);

export default router;
