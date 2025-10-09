import { Request, Response } from 'express';
import { db } from '../../shared/database/index.js';
import { generateToken, hashPassword, comparePassword, generateResetToken, hashResetToken } from '../../shared/utils/index.js';
import { AuthenticatedRequest } from '../../shared/middleware/index.js';
import { SignupInput, LoginInput, ForgotPasswordInput, ResetPasswordInput, UpdateProfileInput, ChangePasswordInput } from './validation.js';

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('🔍 SIGNUP: Starting signup process');
        console.log('🔍 SIGNUP: Request body:', req.body);

        const { email, password, name, photo }: SignupInput = req.body;
        console.log('🔍 SIGNUP: Extracted data:', { email, name, photo, passwordLength: password?.length });

        console.log('🔍 SIGNUP: Checking if user exists...');
        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email },
        });
        console.log('🔍 SIGNUP: Existing user check result:', existingUser ? 'User exists' : 'User does not exist');
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
            return;
        }

        console.log('🔍 SIGNUP: Hashing password...');
        // Hash password
        const hashedPassword = await hashPassword(password);
        console.log('🔍 SIGNUP: Password hashed successfully');

        console.log('🔍 SIGNUP: Creating user in database...');
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

        console.log('🔍 SIGNUP: User created successfully:', user.id);

        console.log('🔍 SIGNUP: Generating JWT token...');
        // Generate token
        const token = generateToken(user.id);
        console.log('🔍 SIGNUP: Token generated successfully');

        console.log('🔍 SIGNUP: Sending success response');
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user,
                token,
            },
        });
    } catch (error: any) {
        console.error('🚨 SIGNUP ERROR:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code,
        });
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && {
                error: error.message,
                stack: error.stack,
            }),
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password }: LoginInput = req.body;

        // Find user
        const user = await db.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }

        // Check password
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    photo: user.photo,
                    createdAt: user.createdAt,
                },
                token,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email }: ForgotPasswordInput = req.body;

        const user = await db.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if user exists or not
            res.json({
                success: true,
                message: 'If an account with that email exists, we have sent a password reset link',
            });
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
        console.log('Password reset token:', resetToken);

        res.json({
            success: true,
            message: 'If an account with that email exists, we have sent a password reset link',
        });
    } catch (error: any) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
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
            res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
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

        res.json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // With JWT, logout is handled on the client side by removing the token
    // Here we just confirm the action
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
};
