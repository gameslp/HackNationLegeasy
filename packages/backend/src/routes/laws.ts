import { Router } from 'express';
import {
  getLaws,
  getLawById,
  createLaw,
  updateLaw,
  deleteLaw,
  getAllStagesForLaw,
} from '../controllers/lawsController';
import { getDiff, analyzeDiffHandler } from '../controllers/stagesController';
import { validate } from '../middleware/validate';
import {
  CreateLawRequestSchema,
  UpdateLawRequestSchema,
  GetLawsQuerySchema,
  DiffQuerySchema,
} from '@repo/validation';

const router = Router();

router.get('/', validate(GetLawsQuerySchema, 'query'), getLaws);
router.post('/', validate(CreateLawRequestSchema, 'body'), createLaw);
router.get('/:lawId', getLawById);
router.put('/:lawId', validate(UpdateLawRequestSchema, 'body'), updateLaw);
router.delete('/:lawId', deleteLaw);
router.get('/:lawId/stages', getAllStagesForLaw);
router.get('/:lawId/diff', validate(DiffQuerySchema, 'query'), getDiff);
router.post('/:lawId/analyze-diff', analyzeDiffHandler);

export default router;
