import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from './controller.js';
import { authenticate, validateRequest } from '../../shared/middleware';
import { updateProfileSchema, changePasswordSchema } from '../auth/validation.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.patch('/profile', validateRequest(updateProfileSchema), updateProfile);
router.post('/change-password', validateRequest(changePasswordSchema), changePassword);

export default router;
