import { Router } from 'express';
import { validateRequest as vr } from '#lib/middleware/validation.js';
import { signup, login, forgotPassword, resetPassword, refresh, logout, verifyEmail, resendOTP } from './controller.js';
import { authRateLimiters as rl } from '#lib/middleware/rateLimiter.js';
import {
    forgotPasswordBodySchema,
    loginBodySchema,
    resendOTPBodySchema,
    resetPasswordBodySchema,
    signupBodySchema,
    verifyEmailBodySchema,
} from '@diran/shared/validation/auth.js';
import timeout from 'connect-timeout';

const router: Router = Router();

router.use(timeout('15s')); // Set a timeout of 15 seconds for all routes in this router

// Public routes with specific rate limiting
router.post('/refresh', refresh);
router.post('/signup', rl.login, vr({ bodySchema: signupBodySchema }), signup);
router.post('/login', rl.login, vr({ bodySchema: loginBodySchema }), login);
router.post('/forgot-password', rl.resetPassword, vr({ bodySchema: forgotPasswordBodySchema }), forgotPassword);
router.post('/reset-password', rl.resetPassword, vr({ bodySchema: resetPasswordBodySchema }), resetPassword);
router.post('/verify-email', rl.otp, vr({ bodySchema: verifyEmailBodySchema }), verifyEmail);
router.post('/resend-otp', rl.resendOTP, vr({ bodySchema: resendOTPBodySchema }), resendOTP);
router.post('/logout', logout);

export default router;
