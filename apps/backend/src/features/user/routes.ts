import { Router } from 'express';
import { validateRequest as vr } from '#lib/middleware/validation.js';
import { authenticate } from '#lib/middleware/auth.js';
import { getProfile, updateProfile, changePassword } from './controller.js';
import { updateProfileSchema, changePasswordSchema } from '@diran/shared/validation/user.js';
import timeout from 'connect-timeout';
import { profileRateLimiter as rl } from '#lib/middleware/rateLimiter.js';

const router: Router = Router();

router.use(timeout('15s')); // Set a timeout of 15 seconds for all routes in this router

// All user routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.patch('/profile', rl.bigWindow, rl.updateProfile, vr(updateProfileSchema), updateProfile);
router.post('/change-password', rl.bigWindow, rl.changePassword, vr(changePasswordSchema), changePassword);

export default router;
