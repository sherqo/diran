import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET: Secret = process.env.JWT_SECRET!; // Secret type
const JWT_EXPIRES_IN = '7d'; // string is fine

export const generateToken = (userId: string): string => {
    const payload = { userId };
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };

    try {
        const token = jwt.sign(payload, JWT_SECRET, options);
        return token;
    } catch (error) {
        throw error;
    }
};

export const verifyToken = (token: string): { userId: string } => {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
};

export const hashPassword = async (password: string): Promise<string> => {
    try {
        const hashed = await bcrypt.hash(password, 12);
        return hashed;
    } catch (error) {
        throw error;
    }
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};

export const generateResetToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export const hashResetToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};
