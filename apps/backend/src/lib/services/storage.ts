import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { ApiError } from '../middleware/errorHandler.js';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors.js';

// Initialize R2 client
const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'diran-storage';
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

interface UploadResult {
    key: string;
    url: string;
}

/**
 * Generate a unique filename for uploaded files
 */
function generateFileKey(userId: string, originalFilename: string, prefix: string): string {
    const ext = originalFilename.split('.').pop() || 'jpg';
    const randomId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${prefix}/${userId}/${timestamp}-${randomId}.${ext}`;
}

/**
 * Get the public URL for an uploaded file
 */
function getPublicUrl(key: string): string {
    if (PUBLIC_URL) {
        return `${PUBLIC_URL}/${key}`;
    }
    return `https://${BUCKET_NAME}.r2.dev/${key}`;
}

/**
 * Validate file before upload
 */
function validateFile(buffer: Buffer, mimetype: string, allowedTypes: string[], maxSize: number): void {
    if (!allowedTypes.includes(mimetype)) {
        throw new ApiError(
            `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR
        );
    }

    if (buffer.length > maxSize) {
        throw new ApiError(
            `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR
        );
    }
}

/**
 * Upload a file to R2 storage
 * Handles images, videos, and any other file type
 */
export async function uploadFile(
    buffer: Buffer,
    mimetype: string,
    originalFilename: string,
    userId: string,
    prefix = 'uploads'
): Promise<UploadResult> {
    // Determine allowed types and max size based on mimetype
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimetype);
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimetype);
    
    if (!isVideo && !isImage) {
        throw new ApiError(
            `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR
        );
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    validateFile(buffer, mimetype, ALLOWED_FILE_TYPES, maxSize);

    // Auto-determine prefix based on file type if not specified or if using default
    if (prefix === 'uploads') {
        prefix = isVideo ? 'videos' : 'images';
    }

    const key = generateFileKey(userId, originalFilename, prefix);

    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
        });

        await r2Client.send(command);

        return {
            key,
            url: getPublicUrl(key),
        };
    } catch (error) {
        console.error('[Storage] Failed to upload file:', error);
        throw new ApiError('Failed to upload file', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<void> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await r2Client.send(command);
    } catch (error) {
        console.error('[Storage] Failed to delete file:', error);
        // Don't throw error, just log it (cleanup is not critical)
    }
}

// Legacy function names for backward compatibility
export const uploadImage = uploadFile;
export const deleteImage = deleteFile;

/**
 * Generate a presigned URL for temporary access (useful for private images)
 */
export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        return await getSignedUrl(r2Client, command, { expiresIn });
    } catch (error) {
        console.error('[Storage] Failed to generate presigned URL:', error);
        throw new ApiError('Failed to generate download URL', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }
}

/**
 * Extract the R2 key from a full URL
 */
export function extractKeyFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        // Remove leading slash
        return pathname.startsWith('/') ? pathname.slice(1) : pathname;
    } catch {
        return null;
    }
}
