import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET: Secret = process.env.JWT_SECRET!; // Secret type
const JWT_EXPIRES_IN = '7d'; // string is fine

export const generateToken = (userId: string): string => {
    console.log('🔍 AUTH: Generating JWT token for user:', userId);
    console.log('🔍 AUTH: JWT_SECRET exists:', !!JWT_SECRET);
    console.log('🔍 AUTH: JWT_EXPIRES_IN:', JWT_EXPIRES_IN);

    const payload = { userId };
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };

    try {
        const token = jwt.sign(payload, JWT_SECRET, options);
        console.log('🔍 AUTH: JWT token generated successfully');
        return token;
    } catch (error) {
        console.error('🚨 AUTH: JWT generation failed:', error);
        throw error;
    }
};

export const verifyToken = (token: string): { userId: string } => {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
};

export const hashPassword = async (password: string): Promise<string> => {
    console.log('🔍 AUTH: Hashing password...');
    console.log('🔍 AUTH: Password length:', password?.length);

    try {
        const hashed = await bcrypt.hash(password, 12);
        console.log('🔍 AUTH: Password hashed successfully');
        return hashed;
    } catch (error) {
        console.error('🚨 AUTH: Password hashing failed:', error);
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
