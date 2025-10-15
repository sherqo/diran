import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthUser } from '@diran/shared/types/auth';

const JWT_SECRET: Secret = process.env.JWT_SECRET!; // Secret type
const JWT_ACCESS_EXPIRES_IN = '15m'; // 15 minutes
const JWT_REFRESH_EXPIRES_IN = '30d'; // 1 month (30 days)
const JWT_EMAIL_VERIFICATION_EXPIRES_IN = '15m'; // 15 minutes

const toAuthUser = (user: any): AuthUser => {
    return {
        id: user.id,
    };
};

// Functions for JWT token generation and verification
export const generateAccessToken = (user: any): string => {
    const payload = toAuthUser(user);
    const options: SignOptions = { expiresIn: JWT_ACCESS_EXPIRES_IN };

    const token = jwt.sign(payload, JWT_SECRET, options);
    return token;
};

export const generateRefreshToken = (userId: string): string => {
    const payload = {
        userId,
        type: 'refresh',
        random: crypto.randomBytes(16).toString('hex'), // Add randomness
    };
    const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN };

    const token = jwt.sign(payload, JWT_SECRET, options);
    return token;
};

export const verifyAccessToken = (token: string): AuthUser => {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
};

export const verifyRefreshToken = (token: string): any => {
    return jwt.verify(token, JWT_SECRET);
};

// Functions for password hashing and comparison
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};

// Functions for OTP generation and hashing
export const generateOTP = (length = 6): string => {
    const digits = '0123456789';
    let otp = '';
    while (otp.length < length) {
        const byte = crypto.randomBytes(1)[0] || 0;
        if (byte < digits.length * 10) {
            // reduce bias
            otp += digits[byte % digits.length];
        }
    }
    return otp;
};

export const hashOTP = (otp: string): string => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

export const compareOTP = (otp: string, hashedOTP: string): boolean => {
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    return otpHash === hashedOTP;
};

// Functions for password reset tokens
export const generateResetToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export const hashResetToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// Functions for email verification JWT tokens
export const generateEmailVerificationToken = (email: string): string => {
    const payload = {
        email,
        type: 'email_verification',
    };
    const options: SignOptions = { expiresIn: JWT_EMAIL_VERIFICATION_EXPIRES_IN };

    const token = jwt.sign(payload, JWT_SECRET, options);
    return token;
};

export const verifyEmailVerificationToken = (token: string): { email: string } => {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== 'email_verification') {
        throw new Error('Invalid token type');
    }

    return { email: decoded.email };
};
