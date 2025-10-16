import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from './controller.js';
import { authenticate } from '#lib/middleware/auth.js';
import { validateRequest } from '#lib/middleware/validation.js';
import { updateProfileSchema, changePasswordSchema } from '@diran/shared/validation/user.js';
import timeout from 'connect-timeout';

const router: Router = Router();

router.use(timeout('15s')); // Set a timeout of 15 seconds for all routes in this router

// All user routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.patch('/profile', validateRequest(updateProfileSchema), updateProfile);
router.post('/change-password', validateRequest(changePasswordSchema), changePassword);

export default router;
