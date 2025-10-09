import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthUser } from '#lib/types/AuthUser';

const JWT_SECRET: Secret = process.env.JWT_SECRET!; // Secret type
const JWT_EXPIRES_IN = '7d'; // string is fine

// Functions for JWT token generation and verification
export const generateToken = (user: AuthUser): string => {
    const payload = user;
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };

    const token = jwt.sign(payload, JWT_SECRET, options);
    return token;
};

export const verifyToken = (token: string): AuthUser => {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
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
