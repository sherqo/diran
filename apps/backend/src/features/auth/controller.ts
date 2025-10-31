import { FastifyRequest, FastifyReply } from 'fastify';
import { sendVerificationOTP, sendPasswordResetToken, clearRefreshTokenSession, createUserSession } from '#features/auth/service.js';
import { ApiError } from '#lib/middleware/errorHandler';
import { sendSuccess } from '#lib/utils/response';
import { db } from '#lib/database/connection.js';
import {
    hashPassword,
    generateAccessToken,
    comparePassword,
    verifyRefreshToken,
    compareOTP,
    hashResetToken,
    generateEmailVerificationToken,
    verifyEmailVerificationToken,
} from '#lib/utils/auth.js';
import { setAccessTokenCookie, clearAuthCookies } from '#lib/services/cookies.js';
import { ErrorCode, HttpStatus } from '@diran/shared/constants/errors';
import type {
    SignupBodyInput,
    LoginBodyInput,
    ForgotPasswordBodyInput,
    ResetPasswordBodyInput,
    VerifyEmailBodyInput,
    ResendOTPBodyInput,
} from '@diran/shared/validation/auth';
import {
    SignupResponseData,
    LoginResponseData,
    ForgotPasswordResponseData,
    ResetPasswordResponseData,
    VerifyEmailResponseData,
    RefreshResponseData,
    ResendOTPResponseData,
    LogoutResponseData,
} from '@diran/shared';

//? User signup
const signup = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { email, password, name }: SignupBodyInput = request.body as SignupBodyInput; // Extract user details from request body

    // Check if user already exists
    const existingUser = await db.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new ApiError('Email already in use', HttpStatus.BAD_REQUEST, ErrorCode.ALREADY_EXISTS);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            emailVerified: false,
        },
    });

    // Send verification OTP
    await sendVerificationOTP(user.id, user.email);

    // Generate email verification token for OTP page access
    const emailToken = generateEmailVerificationToken(user.email);

    const data: SignupResponseData = { emailToken };
    sendSuccess(reply, data, 'Check your email for verification code.', 201);
};

//? User login
const login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { email, password }: LoginBodyInput = request.body as LoginBodyInput;

    // Find user
    const user = await db.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new ApiError('Invalid email or password', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError('Invalid email or password', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
    }

    // Check if email is verified
    if (!user.emailVerified) {
        // Send verification OTP
        await sendVerificationOTP(user.id, user.email);

        // Generate email verification token for OTP page access
        const emailToken = generateEmailVerificationToken(user.email);

        throw new ApiError(
            'Email not verified. A new verification code has been sent to your email.',
            HttpStatus.FORBIDDEN,
            ErrorCode.EMAIL_NOT_VERIFIED,
            { emailToken }
        );
    }

    // User is verified, proceed with login
    // Create user session (tokens + cookies)
    await createUserSession(user, request, reply);

    const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        ...(user.photo && { photo: user.photo }),
        createdAt: user.createdAt.toISOString(),
    };

    const data: LoginResponseData = { user: userData };
    sendSuccess(reply, data, 'Login successful');
};

//? Forgot password - send reset token to email
const forgotPassword = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { email }: ForgotPasswordBodyInput = request.body as ForgotPasswordBodyInput;

    const user = await db.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new ApiError('We could not reach this account', HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    // Send password reset token
    await sendPasswordResetToken(user.id, email);

    const data: ForgotPasswordResponseData = {};
    sendSuccess(reply, data, 'Password reset email sent. Please check your inbox.');
};

//? Reset password - with token
const resetPassword = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { token, password }: ResetPasswordBodyInput = request.body as ResetPasswordBodyInput;

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
        throw new ApiError('Invalid or expired reset token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_RESET_TOKEN);
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
            emailVerified: true, // Verify email if not already verified
        },
    });

    // Create user session (tokens + cookies)
    await createUserSession(user, request, reply);

    const data: ResetPasswordResponseData = { email: user.email };
    sendSuccess(reply, data, 'Password reset successfully');
};

//? Verify email with OTP
const verifyEmail = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { token, otp }: VerifyEmailBodyInput = request.body as VerifyEmailBodyInput;

    const decoded = verifyEmailVerificationToken(token);

    // Find user with matching email and valid expiry
    const user = await db.user.findFirst({
        where: {
            email: decoded.email,
            otpHashed: {
                not: null,
            },
            otpExpires: {
                gt: new Date(),
            },
        },
    });

    if (!user || !user.otpHashed) {
        throw new ApiError('Invalid OTP or email', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
    }

    // Compare OTP with hashed version
    const isOTPValid = compareOTP(otp, user.otpHashed);

    if (!isOTPValid) {
        throw new ApiError('Invalid OTP', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
    }

    // Update user as verified and clear OTP
    await db.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            otpHashed: null,
            otpExpires: null,
        },
    });

    // Create user session (tokens + cookies)
    await createUserSession(user, request, reply);

    const data: VerifyEmailResponseData = {};
    sendSuccess(reply, data, 'Email verified successfully');
};

//? Refresh access token
const refresh = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
        throw new ApiError('Refresh token required', HttpStatus.UNAUTHORIZED, ErrorCode.REFRESH_TOKEN_REQUIRED);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded.userId) {
        throw new Error('Invalid token payload');
    }

    // Find user with this refresh token
    const user = await db.user.findFirst({
        where: {
            refreshToken,
            refreshTokenExpires: {
                gt: new Date(),
            },
        },
    });

    if (!user) {
        throw new ApiError('Invalid or expired refresh token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
    }

    if (!user.emailVerified) {
        throw new ApiError('Email not verified', HttpStatus.FORBIDDEN, ErrorCode.EMAIL_NOT_VERIFIED);
    }

    // Generate new access token
    const accessToken = generateAccessToken({
        id: user.id,
        emailVerified: user.emailVerified,
    });

    // Set new access token cookie
    setAccessTokenCookie(reply, accessToken);

    const data: RefreshResponseData = {};
    sendSuccess(reply, data, 'Token refreshed successfully');
};

//? Resend verification OTP - if not verified yet
const resendOTP = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { token }: ResendOTPBodyInput = request.body as ResendOTPBodyInput;

    const decoded = verifyEmailVerificationToken(token);

    const user = await db.user.findUnique({
        where: { email: decoded.email },
    });

    if (!user) {
        throw new ApiError('User not found', HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    if (user.emailVerified) {
        throw new ApiError('Email already verified', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Send new verification OTP
    await sendVerificationOTP(user.id, user.email);

    // Generate new email verification token for continued OTP page access
    const emailToken = generateEmailVerificationToken(user.email);

    const data: ResendOTPResponseData = { emailToken };
    sendSuccess(reply, data, 'Verification code sent successfully');
};

//? Logout user
const logout = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const refreshToken = request.cookies?.refreshToken;

    // Clear cookies
    clearAuthCookies(reply);

    // If refresh token exists, clear it from DB
    if (refreshToken) {
        await clearRefreshTokenSession(refreshToken);
    }

    const data: LogoutResponseData = {};
    sendSuccess(reply, data, 'Logged out successfully');
};

export { signup, login, forgotPassword, resetPassword, verifyEmail, refresh, resendOTP, logout };
