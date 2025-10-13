import { z } from 'zod';

// User signup schema
export const signupSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    photo: z.url().optional(),
});

// User login schema
export const loginSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
    email: z.email('Invalid email address'),
});

// Reset password schema
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Verify email schema
export const verifyEmailSchema = z.object({
    email: z.email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

// Resend OTP schema
export const resendOTPSchema = z.object({
    email: z.email('Invalid email address'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendOTPInput = z.infer<typeof resendOTPSchema>;
