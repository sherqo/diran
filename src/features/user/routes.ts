import { Router } from 'express';
import { getProfile, updateProfile, changePassword, hasSession } from './controller.js';
import { updateProfileSchema, changePasswordSchema } from './validation.js';
import { authenticate } from '#lib/middleware/auth.js';
import { validateRequest } from '#lib/middleware/validation.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/session', hasSession);
router.get('/profile', getProfile);
router.patch('/profile', validateRequest(updateProfileSchema), updateProfile);
router.post('/change-password', validateRequest(changePasswordSchema), changePassword);

export default router;
