import { Router } from 'express';
import { validateRequest as vr } from '#lib/middleware/validation.js';
import { authenticate } from '#lib/middleware/auth.js';
//! permission middlewares can and MUST be added here
import { createBlock, getBlock, updateBlock, deleteBlock } from './controller.js';
import { createBlockBodySchema, getBlockSchema, updateBlockSchema, deleteBlockSchema } from '@diran/shared/validation/blocks.js';
import timeout from 'connect-timeout';
/**
 * I won't add rate limiters here for now.
 * Blocks operations happens a lot
 * and the rate limit is kinda costly
 * so, the global rate limiter should be enough
 */

const router: Router = Router();

router.use(timeout('10s')); // i do not think block operations should take more than few seconds

// All block routes require authentication
router.use(authenticate);

router.post('/', vr({ bodySchema: createBlockBodySchema }), createBlock);
router.get('/:id', vr({ paramsSchema: getBlockSchema }), getBlock); // need to change this
router.put('/:id', vr({ paramsSchema: updateBlockSchema }), updateBlock);
router.delete('/:id', vr({ paramsSchema: deleteBlockSchema }), deleteBlock);

export default router;
