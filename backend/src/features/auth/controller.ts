import { Request, Response } from 'express';
import { sendVerificationOTP, sendPasswordResetToken, clearRefreshTokenSession, createUserSession } from '#features/auth/service.js';
import type { SignupInput, LoginInput, ForgotPasswordInput, ResetPasswordInput, VerifyEmailInput, ResendOTPInput } from '@shared';
import { ApiError } from '#lib/middleware/errorHandler';
import { sendSuccess } from '#lib/utils/response';
import { db } from '#lib/database/connection.js';
import { hashPassword, generateAccessToken, comparePassword, verifyRefreshToken, compareOTP, hashResetToken } from '#lib/utils/auth.js';
import { ErrorCode, HttpStatus } from '#lib/constants/errors';
import { setAccessTokenCookie, clearAuthCookies } from '#lib/services/cookies.js';

//? User signup
export const signup = async (req: Request, res: Response): Promise<void> => {
    const { email, password, name }: SignupInput = req.body; // Extract user details from request body

    // Check if user already exists
    const existingUser = await db.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new ApiError('User already exists with this email', HttpStatus.CONFLICT, ErrorCode.USER_EXISTS);
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

    sendSuccess(res, { user }, 'User created successfully. Check your email for verification code (OTP).', 201);
};

//? User login
export const login = async (req: Request, res: Response): Promise<void> => {
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
    await createUserSession(user, res);

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
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
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
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
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
        },
    });

    // Create user session (tokens + cookies)
    await createUserSession(user, res);

    sendSuccess(res, {}, 'Password reset successfully');
};

//? Verify email with OTP
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { email, otp }: VerifyEmailInput = req.body;

    // Find user with matching email and valid expiry
    const user = await db.user.findFirst({
        where: {
            email,
            emailVerifyToken: {
                not: null,
            },
            emailVerifyExpires: {
                gt: new Date(),
            },
        },
    });

    if (!user || !user.emailVerifyToken) {
        throw new ApiError('Invalid OTP or email', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
    }

    // Compare OTP with hashed version
    const isOTPValid = compareOTP(otp, user.emailVerifyToken);

    if (!isOTPValid) {
        throw new ApiError('Invalid OTP', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
    }

    // Update user as verified and clear OTP
    await db.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            emailVerifyToken: null,
            emailVerifyExpires: null,
        },
    });

    // Create user session (tokens + cookies)
    await createUserSession(user, res);

    sendSuccess(res, {}, 'Email verified successfully');
};

//? Refresh access token
export const refresh = async (req: Request, res: Response): Promise<void> => {
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
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
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
export const logout = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;

    // Clear cookies
    clearAuthCookies(res);

    // If refresh token exists, clear it from DB
    if (refreshToken) {
        await clearRefreshTokenSession(refreshToken);
    }

    sendSuccess(res, {}, 'Logged out successfully');
};
