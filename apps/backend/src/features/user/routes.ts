import { Router } from 'express';
import { validateRequest as vr } from '#lib/middleware/validation.js';
import { authenticate } from '#lib/middleware/auth.js';
import { getProfile, updateProfile, changePassword } from './controller.js';
import { updateProfileSchema, changePasswordSchema } from '@diran/shared/validation/user.js';
import to from 'connect-timeout';
import { profileRateLimiter as rl } from '#lib/middleware/rateLimiter.js';

const router: Router = Router();

// All user routes require authentication
router.get('/profile', to('5s'), authenticate, getProfile);
router.patch('/profile', rl.bigWindow, rl.updateProfile, to('10s'), vr({ bodySchema: updateProfileSchema }), authenticate, updateProfile);
router.post(
    '/change-password',
    rl.bigWindow,
    rl.changePassword,
    to('5s'),
    vr({ bodySchema: changePasswordSchema }),
    authenticate,
    changePassword
);

export default router;
