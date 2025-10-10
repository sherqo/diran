import { Router } from 'express';
import { signup, login, forgotPassword, resetPassword, refresh, logout } from './controller.js';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './validation.js';
import { validateRequest } from '#lib/middleware/validation.js';

const router = Router();

// Public routes
router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
