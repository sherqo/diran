import { Request, Response } from 'express';
import { SignupInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from './validation.js';
import { ApiError } from '#lib/middleware/errorHandler';
import { sendSuccess } from '#lib/utils/response';
import { db } from '#lib/database/connection.js';
import { hashPassword, generateToken, comparePassword, generateResetToken, hashResetToken } from '#lib/utils/auth.js';
import { ErrorCode, HttpStatus } from '#lib/constants/errors';
import { isDevelopment } from '#lib/utils/common.js';

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

    // Generate token
    const token = generateToken(user);

    sendSuccess(res, { user, token }, 'User created successfully', 201);
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

    // Generate token
    const token = generateToken(user);

    const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        photo: user.photo,
        createdAt: user.createdAt,
    };

    sendSuccess(res, { user: userData, token }, 'Login successful');
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
