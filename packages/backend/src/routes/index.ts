import { Router } from 'express';
import lawsRouter from './laws.js';
import phasesRouter from './phases.js';
import stagesRouter from './stages.js';
import adminRouter from './admin.js';

const router = Router();

router.use('/laws', lawsRouter);
router.use('/laws/:lawId/phases', phasesRouter);
router.use('/laws/:lawId/phases/:phaseId/stages', stagesRouter);
router.use('/admin', adminRouter);

export default router;
