import { Request, Response } from 'express';
import { db } from '../../shared/database';
import { generateToken, hashPassword, comparePassword, generateResetToken, hashResetToken } from '../../shared/utils';
import { AuthenticatedRequest } from '../../shared/middleware';
import { SignupInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from './validation.js';
import { sendSuccess, sendConflict, sendUnauthorized } from '../../shared/utils/response.js';
import { asyncHandler } from '../../shared/middleware/errorHandler.js';

export const signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password, name, photo }: SignupInput = req.body;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        sendConflict(res, 'User already exists with this email');
        return;
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
    const token = generateToken(user.id);

    sendSuccess(res, { user, token }, 'User created successfully', 201);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password }: LoginInput = req.body;

    // Find user
    const user = await db.user.findUnique({
        where: { email },
    });

    if (!user) {
        sendUnauthorized(res, 'Invalid email or password');
        return;
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        sendUnauthorized(res, 'Invalid email or password');
        return;
    }

    // Generate token
    const token = generateToken(user.id);

    const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        photo: user.photo,
        createdAt: user.createdAt,
    };

    sendSuccess(res, { user: userData, token }, 'Login successful');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    if (process.env.NODE_ENV === 'development') {
        console.log('Password reset token:', resetToken);
    }

    sendSuccess(res, null, 'If an account with that email exists, we have sent a password reset link');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
        sendUnauthorized(res, 'Invalid or expired reset token');
        return;
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
});
