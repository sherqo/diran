import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '#lib/middleware/auth';
import { uploadFile as uploadFileToStorage } from '#lib/services/storage';
import { sendSuccess } from '#lib/utils/response';
import { ApiError } from '#lib/middleware/errorHandler';
import { ErrorCode, HttpStatus } from '@diran/shared/constants/errors';

/**
 * Upload a file (image or video)
 */
export const uploadFile = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const data = await req.file();

    if (!data) {
        throw new ApiError('No file uploaded', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const buffer = await data.toBuffer();
    const uploadResult = await uploadFileToStorage(buffer, data.mimetype, data.filename, req.user!.id);

    sendSuccess(reply, { url: uploadResult.url }, 'File uploaded successfully', HttpStatus.CREATED);
};
