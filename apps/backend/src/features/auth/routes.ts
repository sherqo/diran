import { Router } from 'express';
import { validateRequest as vr } from '#lib/middleware/validation.js';
import { signup, login, forgotPassword, resetPassword, refresh, logout, verifyEmail, resendOTP } from './controller.js';
import { authRateLimiters as rl } from '#lib/middleware/rateLimiter.js';
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
router.post('/signup', rl.login, vr(signupSchema), signup);
router.post('/login', rl.login, vr(loginSchema), login);
router.post('/forgot-password', rl.resetPassword, vr(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', rl.resetPassword, vr(resetPasswordSchema), resetPassword);
router.post('/verify-email', rl.otp, vr(verifyEmailSchema), verifyEmail);
router.post('/resend-otp', rl.resendOTP, vr(resendOTPSchema), resendOTP);
router.post('/logout', logout);

export default router;
