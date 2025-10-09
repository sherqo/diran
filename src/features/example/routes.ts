import { Router } from 'express';
import { createExample, getExamples } from './controller.js';
import { createExampleSchema } from './validation.js';
import { authenticate } from '#lib/middleware';
import { validateRequest } from '#lib/middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', validateRequest(createExampleSchema), createExample);
router.get('/', getExamples);

export default router;
