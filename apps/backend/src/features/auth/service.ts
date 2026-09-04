import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../lib/database/connection.js';
import { generateOTP, hashOTP, generateResetToken, hashResetToken } from '../../lib/utils/auth.js';
import { sendMail, emailTemplates } from '../../lib/services/email.js';
import { ApiError } from '../../lib/middleware/errorHandler.js';
import { generateAccessToken, generateRefreshToken } from '../../lib/utils/auth.js';
import { setAccessTokenCookie, setRefreshTokenCookie } from '../../lib/services/cookies.js';
import ms from 'ms';
import { ErrorCode, HttpStatus } from '@diran/shared/constants/errors.js';

const sendVerificationOTP = async (userId: string, email: string): Promise<void> => {
    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpires = new Date(Date.now() + ms('15m')); // 15 minutes

    // Update user with verify OTP
    await db.user.update({
        where: { id: userId },
        data: {
            otpHashed: hashedOTP,
            otpExpires: otpExpires,
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

const sendPasswordResetToken = async (userId: string, email: string): Promise<void> => {
    // Generate reset token
    const resetToken = generateResetToken();
    const hashedResetToken = hashResetToken(resetToken);
    const resetPasswordExpires = new Date(Date.now() + ms('15m')); // 15 minutes

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
            html: emailTemplates.resetPassword(resetToken, email),
        });
    } catch (error) {
        console.error('Failed to send reset email:', error);
        throw new ApiError('Failed to send reset email', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }
};

const createUserSession = async (user: any, request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenExpires = new Date(Date.now() + ms('30d')); // 30 days

    await db.user.update({
        where: { id: user.id },
        data: {
            refreshToken,
            refreshTokenExpires,
        },
    });

    // Set cookies
    setAccessTokenCookie(reply, accessToken);
    setRefreshTokenCookie(reply, refreshToken);

    sendSessionCreatedNotification(user.email, request);
};

const clearRefreshTokenSession = async (refreshToken: string): Promise<void> => {
    await db.user.updateMany({
        where: { refreshToken },
        data: {
            refreshToken: null,
            refreshTokenExpires: null,
        },
    });
};

const sendSessionCreatedNotification = async (email: string, request: FastifyRequest): Promise<void> => {
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const ip = request.headers['x-forwarded-for'] || 'Unknown';
    // Send friendly notification email (no OTP, just info)
    try {
        await sendMail({
            to: [email],
            subject: 'New Sign-in to Your Diran AI Account',
            html: emailTemplates.newSession(email, userAgent, ip),
        });
    } catch (error) {
        console.error('Failed to send session created notification:', error);
    }
};

export { sendVerificationOTP, sendPasswordResetToken, createUserSession, clearRefreshTokenSession, sendSessionCreatedNotification };
