import { Router } from 'express';
import { createExample, getExamples } from './controller.js';
import { authenticate, validateRequest } from '../../shared/middleware/index.js';
import { createExampleSchema } from './validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', validateRequest(createExampleSchema), createExample);
router.get('/', getExamples);

export default router;
