import { Response } from 'express';
import { AuthenticatedRequest } from '#lib/middleware/auth';
import { db } from '#lib/database/connection';
import { comparePassword, hashPassword } from '#lib/utils/auth';
import { sendSuccess } from '#lib/utils/response';
import { ApiError } from '#lib/middleware/errorHandler';
import { ErrorCode, HttpStatus } from '@diran/shared/constants/errors';
import { ChangePasswordInput, UpdateProfileInput } from '@diran/shared/validation/user';
import { GetProfileResponseData, UpdateProfileResponseData, ChangePasswordResponseData } from '@diran/shared';

const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = await db.user.findUnique({
        where: { id: req.user!.id },
        select: {
            id: true,
            email: true,
            name: true,
            photo: true,
            createdAt: true,
        },
    });

    const userData = {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        ...(user!.photo && { photo: user!.photo }),
        createdAt: user!.createdAt.toISOString(),
    };

    const data: GetProfileResponseData = { user: userData };
    sendSuccess(res, data);
};

const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
        },
    });

    const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        ...(user.photo && { photo: user.photo }),
        createdAt: user.createdAt.toISOString(),
    };

    const data: UpdateProfileResponseData = { user: userData };
    sendSuccess(res, data, 'Profile updated successfully');
};

const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword }: ChangePasswordInput = req.body;

    // Get user with password
    const user = await db.user.findUnique({
        where: { id: req.user!.id },
    });

    if (!user) {
        throw new ApiError('User not found', HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
        throw new ApiError('Current password is incorrect', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_PASSWORD);
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await db.user.update({
        where: { id: req.user!.id },
        data: { password: hashedNewPassword },
    });

    const data: ChangePasswordResponseData = {};
    sendSuccess(res, data, 'Password changed successfully');
};

export { getProfile, updateProfile, changePassword };
