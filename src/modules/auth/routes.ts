import { Router } from 'express';
import { signup, login, forgotPassword, resetPassword } from './controller.js';
import { validateRequest } from '../../shared/middleware';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './validation.js';

const router = Router();

// Public routes
router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);

export default router;
