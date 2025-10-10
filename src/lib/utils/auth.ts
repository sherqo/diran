import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthUser } from '#lib/types/AuthUser';

const JWT_SECRET: Secret = process.env.JWT_SECRET!; // Secret type
const JWT_ACCESS_EXPIRES_IN = '15m'; // 15 minutes
const JWT_REFRESH_EXPIRES_IN = '30d'; // 1 month (30 days)

const toAuthUser = (user: AuthUser): AuthUser => {
    return {
        id: user.id,
        emailVerified: user.emailVerified,
    };
};

// Functions for JWT token generation and verification
export const generateAccessToken = (user: AuthUser): string => {
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

export const verifyToken = (token: string): AuthUser => {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
};

export const verifyRefreshToken = (token: string): any => {
    return jwt.verify(token, JWT_SECRET);
};

// Functions for password hashing and comparison
export const hashPassword = async (password: string): Promise<string> => {
    const hashed = await bcrypt.hash(password, 12);
    return hashed;
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};

// Functions for password reset tokens
export const generateResetToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export const hashResetToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};
