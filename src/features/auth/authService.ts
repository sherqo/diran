import { db } from '#lib/database/connection.js';
import { generateOTP, hashOTP, generateResetToken, hashResetToken } from '#lib/utils/auth.js';
import { sendMail, emailTemplates } from '#lib/services/email.js';
import { ApiError } from '#lib/middleware/errorHandler.js';
import { ErrorCode, HttpStatus } from '#lib/constants/errors.js';
import { generateAccessToken, generateRefreshToken } from '#lib/utils/auth.js';
import { setAccessTokenCookie, setRefreshTokenCookie } from '#lib/services/cookies.js';

export const sendVerificationOTP = async (userId: string, email: string): Promise<void> => {
    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const emailVerifyExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with verify OTP
    await db.user.update({
        where: { id: userId },
        data: {
            emailVerifyToken: hashedOTP,
            emailVerifyExpires,
        },
    });

    // Send verification email
    try {
        await sendMail({
            to: [email],
            subject: 'Verify Your Email',
            html: emailTemplates.verifyEmail(otp),
        });
    } catch (error) {
        throw new ApiError('Failed to send verification email', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }
};

export const sendPasswordResetToken = async (userId: string, email: string): Promise<void> => {
    // Generate reset token
    const resetToken = generateResetToken();
    const hashedResetToken = hashResetToken(resetToken);
    const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token
    await db.user.update({
        where: { id: userId },
        data: {
            resetPasswordToken: hashedResetToken,
            resetPasswordExpires,
        },
    });

    // Send reset email
    try {
        await sendMail({
            to: [email],
            subject: 'Password Reset',
            html: emailTemplates.resetPassword(resetToken),
        });
    } catch (error) {
        console.error('Failed to send reset email:', error);
        throw new ApiError('Failed to send reset email', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }
};

export const createRefreshTokenSession = async (userId: string, refreshToken: string): Promise<void> => {
    const refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.user.update({
        where: { id: userId },
        data: {
            refreshToken,
            refreshTokenExpires,
        },
    });
};

export const createUserSession = async (user: any, res: any): Promise<void> => {
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);

    // Create refresh token session
    await createRefreshTokenSession(user.id, refreshToken);

    // Set cookies
    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);
};

export const clearRefreshTokenSession = async (refreshToken: string): Promise<void> => {
    await db.user.updateMany({
        where: { refreshToken },
        data: {
            refreshToken: null,
            refreshTokenExpires: null,
        },
    });
};
