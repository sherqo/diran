import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { ApiError } from '#lib/middleware/errorHandler';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors';

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

// image MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface UploadResult {
    key: string;
    url: string;
}

/**
 * Generate a unique filename for uploaded images
 */
function generateImageKey(userId: string, originalFilename: string, prefix = 'profiles'): string {
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
    // Use R2.dev public URL if no custom domain is set
    return `https://${BUCKET_NAME}.r2.dev/${key}`;
}

/**
 * Validate image file
 */
function validateImage(buffer: Buffer, mimetype: string): void {
    if (!ALLOWED_IMAGE_TYPES.includes(mimetype)) {
        throw new ApiError(
            `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR
        );
    }

    if (buffer.length > MAX_FILE_SIZE) {
        throw new ApiError(
            `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR
        );
    }
}

/**
 * Upload an image to R2
 */
export async function uploadImage(
    buffer: Buffer,
    mimetype: string,
    originalFilename: string,
    userId: string,
    prefix = 'profiles'
): Promise<UploadResult> {
    validateImage(buffer, mimetype);

    const key = generateImageKey(userId, originalFilename, prefix);

    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
            // Make the object publicly readable
            // Note: You need to configure bucket settings in Cloudflare dashboard
            // to allow public access or use custom domain
        });

        await r2Client.send(command);

        return {
            key,
            url: PUBLIC_URL ? `${PUBLIC_URL}/${key}` : `https://${BUCKET_NAME}.r2.dev/${key}`,
        };
    } catch (error) {
        console.error('[Storage] Failed to upload image:', error);
        throw new ApiError('Failed to upload image', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }
}

/**
 * Delete an image from R2
 */
export async function deleteImage(key: string): Promise<void> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await r2Client.send(command);
    } catch (error) {
        console.error('[Storage] Failed to delete image:', error);
        // Don't throw error, just log it (old image cleanup is not critical)
    }
}

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
