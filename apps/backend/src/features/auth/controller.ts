import { Request, Response } from 'express';
import {
    sendVerificationOTP,
    sendPasswordResetToken,
    clearRefreshTokenSession,
    createUserSession,
    sendSignupAttemptNotification,
} from '#features/auth/service.js';
import { ApiError } from '#lib/middleware/errorHandler';
import { sendSuccess } from '#lib/utils/response';
import { db } from '#lib/database/connection.js';
import { hashPassword, generateAccessToken, comparePassword, verifyRefreshToken, compareOTP, hashResetToken } from '#lib/utils/auth.js';
import { setAccessTokenCookie, clearAuthCookies } from '#lib/services/cookies.js';
import type {
    SignupInput,
    LoginInput,
    ForgotPasswordInput,
    ResetPasswordInput,
    VerifyEmailInput,
    ResendOTPInput,
} from '@diran/shared/validation/auth';
import { ErrorCode, HttpStatus } from '@diran/shared/constants/errors';

export { signup, login, forgotPassword, resetPassword, verifyEmail, refresh, resendOTP, logout };

//? User signup
const signup = async (req: Request, res: Response): Promise<void> => {
    const { email, password, name }: SignupInput = req.body; // Extract user details from request body

    // Check if user already exists
    const existingUser = await db.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        await sendSignupAttemptNotification(existingUser.email);
        sendSuccess(res, {}, 'Check your email for verification code.', 201);
        return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            emailVerified: false,
        },
    });

    // Send verification OTP
    await sendVerificationOTP(user.id, user.email);

    sendSuccess(res, {}, 'Check your email for verification code.', 201);
};

//? User login
const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password }: LoginInput = req.body;

    // Find user
    const user = await db.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new ApiError('Invalid email or password', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError('Invalid email or password', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
    }

    // Check if email is verified
    if (!user.emailVerified) {
        // Send verification OTP
        await sendVerificationOTP(user.id, user.email);
        throw new ApiError(
            'Email not verified. A new verification code has been sent to your email.',
            HttpStatus.FORBIDDEN,
            ErrorCode.EMAIL_NOT_VERIFIED
        );
    }

    // User is verified, proceed with login
    // Create user session (tokens + cookies)
    await createUserSession(user, req, res);

    const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        photo: user.photo,
        createdAt: user.createdAt,
    };

    sendSuccess(res, { user: userData }, 'Login successful');
};

//? Forgot password - send reset token to email
const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email }: ForgotPasswordInput = req.body;

    const user = await db.user.findUnique({
        where: { email },
    });

    if (!user) {
        // Don't reveal if user exists or not
        sendSuccess(res, {}, 'If an account with that email exists, we have sent a password reset link');
        return;
    }

    // Send password reset token
    await sendPasswordResetToken(user.id, email);

    sendSuccess(res, {}, 'If an account with that email exists, we have sent a password reset link');
};

//? Reset password - with token
const resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { token, password }: ResetPasswordInput = req.body;

    // Hash the token to compare with database
    const hashedToken = hashResetToken(token);

    // Find user with valid reset token
    const user = await db.user.findFirst({
        where: {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {
                gt: new Date(),
            },
        },
    });

    if (!user) {
        throw new ApiError('Invalid or expired reset token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_RESET_TOKEN);
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    await db.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            emailVerified: true, // Verify email if not already verified
        },
    });

    // Create user session (tokens + cookies)
    await createUserSession(user, req, res);

    sendSuccess(res, { email: user.email }, 'Password reset successfully');
};

//? Verify email with OTP
const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { email, otp }: VerifyEmailInput = req.body;

    // Find user with matching email and valid expiry
    const user = await db.user.findFirst({
        where: {
            email,
            otpHashed: {
                not: null,
            },
            otpExpires: {
                gt: new Date(),
            },
        },
    });

    if (!user || !user.otpHashed) {
        throw new ApiError('Invalid OTP or email', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
    }

    // Compare OTP with hashed version
    const isOTPValid = compareOTP(otp, user.otpHashed);

    if (!isOTPValid) {
        throw new ApiError('Invalid OTP', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
    }

    // Update user as verified and clear OTP
    await db.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            otpHashed: null,
            otpExpires: null,
        },
    });

    // Create user session (tokens + cookies)
    await createUserSession(user, req, res);

    sendSuccess(res, {}, 'Email verified successfully');
};

//? Refresh access token
const refresh = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        throw new ApiError('Refresh token required', HttpStatus.UNAUTHORIZED, ErrorCode.REFRESH_TOKEN_REQUIRED);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded.userId) {
        throw new Error('Invalid token payload');
    }

    // Find user with this refresh token
    const user = await db.user.findFirst({
        where: {
            refreshToken,
            refreshTokenExpires: {
                gt: new Date(),
            },
        },
    });

    if (!user) {
        throw new ApiError('Invalid or expired refresh token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
    }

    if (!user.emailVerified) {
        throw new ApiError('Email not verified', HttpStatus.FORBIDDEN, ErrorCode.EMAIL_NOT_VERIFIED);
    }

    // Generate new access token
    const accessToken = generateAccessToken({
        id: user.id,
        emailVerified: user.emailVerified,
    });

    // Set new access token cookie
    setAccessTokenCookie(res, accessToken);

    sendSuccess(res, {}, 'Token refreshed successfully');
};

//? Resend verification OTP - if not verified yet
const resendOTP = async (req: Request, res: Response): Promise<void> => {
    const { email }: ResendOTPInput = req.body;

    const user = await db.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new ApiError('User not found', HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    if (user.emailVerified) {
        throw new ApiError('Email already verified', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Send new verification OTP
    await sendVerificationOTP(user.id, user.email);

    sendSuccess(res, {}, 'Verification code sent successfully');
};

//? Logout user
const logout = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;

    // Clear cookies
    clearAuthCookies(res);

    // If refresh token exists, clear it from DB
    if (refreshToken) {
        await clearRefreshTokenSession(refreshToken);
    }

    sendSuccess(res, {}, 'Logged out successfully');
};
