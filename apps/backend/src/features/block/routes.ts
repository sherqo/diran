import { Router } from 'express';
import { validateRequest as vr } from '#lib/middleware/validation.js';
import { authenticate as auth } from '#lib/middleware/auth.js';
import { validatePermission as perm } from './middlewares.js';
import { createBlock, getBlock, updateBlock, deleteBlock } from './controller.js';
import {
    createBlockBodySchema,
    getBlockParamSchema,
    updateBlockParamSchema,
    deleteBlockParamSchema,
} from '@diran/shared/validation/block.js';
import to from 'connect-timeout';
/**
 * I won't add rate limiters here for now.
 * Blocks operations happens a lot
 * and the rate limit is kinda costly
 * so, the global rate limiter should be enough
 */

const router: Router = Router();

// ngl, a skill issue to decide what is the right order for middlewares

// All block routes require authentication
router.post('/', to('5s'), vr({ bodySchema: createBlockBodySchema }), auth, createBlock);

router.use(to('4s')); // less risky than creation
router.get('/:id', vr({ paramsSchema: getBlockParamSchema }), auth, perm, getBlock);
router.put('/:id', vr({ paramsSchema: updateBlockParamSchema }), auth, perm, updateBlock);
router.delete('/:id', vr({ paramsSchema: deleteBlockParamSchema }), auth, perm, deleteBlock);

export default router;
