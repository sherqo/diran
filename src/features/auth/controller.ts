import { Request, Response } from 'express';
import { SignupInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from './validation.js';
import { ApiError } from '#lib/middleware/errorHandler';
import { sendSuccess } from '#lib/utils/response';
import { db } from '#lib/database/connection.js';
import {
    hashPassword,
    generateAccessToken,
    comparePassword,
    generateResetToken,
    hashResetToken,
    generateRefreshToken,
    verifyRefreshToken,
} from '#lib/utils/auth.js';
import { ErrorCode, HttpStatus } from '#lib/constants/errors';
import { isDevelopment } from '#lib/utils/common.js';
import { sendMail } from '#lib/services/email/client.js';

export const signup = async (req: Request, res: Response): Promise<void> => {
    const { email, password, name, photo }: SignupInput = req.body;

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
            email,
            password: hashedPassword,
            name,
            photo: photo || null,
        },
        select: {
            id: true,
            email: true,
            name: true,
            photo: true,
            createdAt: true,
        },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Update user with refresh token
    await db.user.update({
        where: { id: user.id },
        data: {
            refreshToken,
            refreshTokenExpires,
        },
    });

    // Set cookies
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: !isDevelopment,
        sameSite: 'none',
        domain: process.env.COOKIE_DOMAIN || undefined,
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: !isDevelopment,
        sameSite: 'none',
        domain: process.env.COOKIE_DOMAIN || undefined,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/v1/auth/refresh', // Refresh token only sent to refresh endpoint
    });

    sendSuccess(res, { user }, 'User created successfully', 201);
};

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

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Update user with refresh token
    await db.user.update({
        where: { id: user.id },
        data: {
            refreshToken,
            refreshTokenExpires,
        },
    });

    // Set cookies
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: !isDevelopment,
        sameSite: 'none',
        domain: process.env.COOKIE_DOMAIN || undefined,
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: !isDevelopment,
        sameSite: 'none',
        domain: process.env.COOKIE_DOMAIN || undefined,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/v1/auth/refresh', // Refresh token only sent to refresh endpoint
    });

    const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        photo: user.photo,
        createdAt: user.createdAt,
    };

    sendSuccess(res, { user: userData }, 'Login successful');
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email }: ForgotPasswordInput = req.body;

    const user = await db.user.findUnique({
        where: { email },
    });

    if (!user) {
        // Don't reveal if user exists or not
        sendSuccess(res, null, 'If an account with that email exists, we have sent a password reset link');
        return;
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedResetToken = hashResetToken(resetToken);
    const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token
    await db.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: hashedResetToken,
            resetPasswordExpires,
        },
    });

    // TODO: Send email with reset token
    // For now, just log the token (remove in production)
    await sendMail({
        to: [email],
        subject: 'Password Reset',
        html: `Your reset token is: ${resetToken}`,
    });
    if (isDevelopment) {
        console.log('Password reset token:', resetToken);
    }

    sendSuccess(res, null, 'If an account with that email exists, we have sent a password reset link');
};

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
    sendSuccess(res, null, 'Password reset successfully');
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        throw new ApiError('Refresh token required', HttpStatus.UNAUTHORIZED, ErrorCode.REFRESH_TOKEN_REQUIRED);
    }

    try {
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded.userId) {
            throw new Error('Invalid token payload');
        }
    } catch (error) {
        throw new ApiError('Invalid refresh token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
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

    // Generate new access token
    const accessToken = generateAccessToken({
        id: user.id,
    });

    // Set new access token cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: !isDevelopment,
        sameSite: 'none',
        domain: process.env.COOKIE_DOMAIN || undefined,
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    sendSuccess(res, {}, 'Token refreshed successfully');
};
