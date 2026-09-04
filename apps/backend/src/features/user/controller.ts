import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '#lib/middleware/auth';
import { db } from '#lib/database/connection';
import { comparePassword, hashPassword } from '#lib/utils/auth';
import { sendSuccess } from '#lib/utils/response';
import { ApiError } from '#lib/middleware/errorHandler';
import { ErrorCode, HttpStatus } from '@diran/shared/constants/errors.js';
import { ChangePasswordInput, UpdateProfileInput } from '@diran/shared/validation/user.js';
import {
    GetProfileResponseData,
    UpdateProfileResponseData,
    ChangePasswordResponseData,
    UploadProfilePhotoResponseData,
} from '@diran/shared';
import { uploadImage, deleteImage, extractKeyFromUrl } from '#lib/services/storage';

const getProfile = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
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
    sendSuccess(reply, data);
};

const updateProfile = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { name, photo }: UpdateProfileInput = req.body as UpdateProfileInput;

    const photoValue = !photo ? null : photo; // "" or undefined → null, else actual string

    const user = await db.user.update({
        where: { id: req.user!.id },
        data: {
            ...(name && { name }),
            photo: photoValue,
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
    sendSuccess(reply, data, 'Profile updated successfully');
};

const changePassword = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { currentPassword, newPassword }: ChangePasswordInput = req.body as ChangePasswordInput;

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
    sendSuccess(reply, data, 'Password changed successfully');
};

const uploadProfilePhoto = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    // Get the uploaded file
    const data = await req.file();

    if (!data) {
        throw new ApiError('No file uploaded', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Convert file stream to buffer
    const buffer = await data.toBuffer();

    // Get user's current photo to delete old one
    const user = await db.user.findUnique({
        where: { id: req.user!.id },
        select: { photo: true },
    });

    // Upload new photo
    const uploadResult = await uploadImage(buffer, data.mimetype, data.filename, req.user!.id, 'profiles');

    // Update user with new photo URL
    const updatedUser = await db.user.update({
        where: { id: req.user!.id },
        data: { photo: uploadResult.url },
        select: {
            id: true,
            email: true,
            name: true,
            photo: true,
            createdAt: true,
        },
    });

    // Delete old photo if it exists (fire and forget)
    if (user?.photo) {
        const oldKey = extractKeyFromUrl(user.photo);
        if (oldKey) {
            deleteImage(oldKey).catch(err => console.error('[Profile] Failed to delete old photo:', err));
        }
    }

    const userData = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        ...(updatedUser.photo && { photo: updatedUser.photo }),
        createdAt: updatedUser.createdAt.toISOString(),
    };

    const responseData: UploadProfilePhotoResponseData = { user: userData };
    sendSuccess(reply, responseData, 'Profile photo uploaded successfully');
};

export { getProfile, updateProfile, changePassword, uploadProfilePhoto };
