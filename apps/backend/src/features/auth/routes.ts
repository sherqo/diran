import { Router } from 'express';
import { signup, login, forgotPassword, resetPassword, refresh, logout, verifyEmail, resendOTP } from './controller.js';
import { validateRequest } from '#lib/middleware/validation.js';
import { authRateLimiters } from '#lib/middleware/rateLimiter.js';
import {
    forgotPasswordSchema,
    loginSchema,
    resendOTPSchema,
    resetPasswordSchema,
    signupSchema,
    verifyEmailSchema,
} from '@diran/shared/validation/auth.js';
import timeout from 'connect-timeout';

const router: Router = Router();

router.use(timeout('15s')); // Set a timeout of 15 seconds for all routes in this router

// Public routes with specific rate limiting
router.post('/refresh', refresh);
router.post('/signup', authRateLimiters.login, validateRequest(signupSchema), signup);
router.post('/login', authRateLimiters.login, validateRequest(loginSchema), login);
router.post('/forgot-password', authRateLimiters.resetPassword, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimiters.resetPassword, validateRequest(resetPasswordSchema), resetPassword);
router.post('/verify-email', authRateLimiters.otp, validateRequest(verifyEmailSchema), verifyEmail);
router.post('/resend-otp', authRateLimiters.resendOTP, validateRequest(resendOTPSchema), resendOTP);
router.post('/logout', logout);

export default router;
