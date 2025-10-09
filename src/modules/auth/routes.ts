import { Router } from 'express';
import { signup, login, logout, forgotPassword, resetPassword } from './controller.js';
import { authenticate, validateRequest } from '../../shared/middleware/index.js';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './validation.js';

const router = Router();

// Public routes
router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);

// Protected routes
router.use(authenticate); // All routes below this middleware require authentication
router.post('/logout', logout);

export default router;
