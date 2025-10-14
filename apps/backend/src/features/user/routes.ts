import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from './controller.js';

import { authenticate } from '#lib/middleware/auth.js';
import { validateRequest } from '#lib/middleware/validation.js';
import { updateProfileSchema, changePasswordSchema } from '@diran/shared/validation/user.js';

const router: Router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.patch('/profile', validateRequest(updateProfileSchema), updateProfile);
router.post('/change-password', validateRequest(changePasswordSchema), changePassword);

export default router;
