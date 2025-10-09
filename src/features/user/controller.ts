import { Request, Response } from 'express';
import { db } from '../../lib/database';
import { hashPassword, comparePassword } from '../../lib/utils';
import { ChangePasswordInput, UpdateProfileInput } from './validation';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = await db.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true,
                email: true,
                name: true,
                photo: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.json({
            success: true,
            data: { user },
        });
    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { name, photo }: UpdateProfileInput = req.body;

        const user = await db.user.update({
            where: { id: req.user!.id },
            data: {
                ...(name && { name }),
                ...(photo && { photo }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                photo: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user },
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { currentPassword, newPassword }: ChangePasswordInput = req.body;

        // Get user with password
        const user = await db.user.findUnique({
            where: { id: req.user!.id },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Verify current password
        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            res.status(400).json({
                success: false,
                message: 'Current password is incorrect',
            });
            return;
        }

        // Hash new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update password
        await db.user.update({
            where: { id: req.user!.id },
            data: { password: hashedNewPassword },
        });

        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error: any) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
