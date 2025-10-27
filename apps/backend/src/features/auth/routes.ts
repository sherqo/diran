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
import to from 'connect-timeout';

const router: Router = Router();

// Public routes with specific rate limiting
router.post('/refresh', to('5s'), refresh);
router.post('/signup', rl.login, to('5s'), vr({ bodySchema: signupBodySchema }), signup);
router.post('/login', rl.login, to('5s'), vr({ bodySchema: loginBodySchema }), login);
router.post('/forgot-password', rl.resetPassword, to('5s'), vr({ bodySchema: forgotPasswordBodySchema }), forgotPassword);
router.post('/reset-password', rl.resetPassword, to('5s'), vr({ bodySchema: resetPasswordBodySchema }), resetPassword);
router.post('/verify-email', rl.otp, to('5s'), vr({ bodySchema: verifyEmailBodySchema }), verifyEmail);
router.post('/resend-otp', rl.resendOTP, to('5s'), vr({ bodySchema: resendOTPBodySchema }), resendOTP);
router.post('/logout', to('5s'), logout);

export default router;
