import { Router } from 'express';
import { signup, login, forgotPassword, resetPassword, refresh, logout, verifyEmail, resendOTP } from './controller.js';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema, resendOTPSchema } from '#shared';
import { validateRequest } from '#lib/middleware/validation.js';

const router: Router = Router();

// Public routes
router.post('/refresh', refresh);
router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);
router.post('/verify-email', validateRequest(verifyEmailSchema), verifyEmail);
router.post('/resend-otp', validateRequest(resendOTPSchema), resendOTP);
router.post('/logout', logout);

export default router;
