import { Router } from 'express';
import lawsRouter from './laws';
import phasesRouter from './phases';
import stagesRouter from './stages';
import adminRouter from './admin';

const router = Router();

router.use('/laws', lawsRouter);
router.use('/laws/:lawId/phases', phasesRouter);
router.use('/laws/:lawId/phases/:phaseId/stages', stagesRouter);
router.use('/admin', adminRouter);

export default router;
