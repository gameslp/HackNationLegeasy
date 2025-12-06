import { Router } from 'express';
import {
  getPhases,
  getPhaseById,
  createPhase,
  updatePhase,
  deletePhase,
} from '../controllers/phasesController';
import { validate } from '../middleware/validate';
import { CreatePhaseRequestSchema, UpdatePhaseRequestSchema } from '@repo/validation';

const router = Router({ mergeParams: true });

router.get('/', getPhases);
router.post('/', validate(CreatePhaseRequestSchema, 'body'), createPhase);
router.get('/:phaseId', getPhaseById);
router.put('/:phaseId', validate(UpdatePhaseRequestSchema, 'body'), updatePhase);
router.delete('/:phaseId', deletePhase);

export default router;
