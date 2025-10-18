import { z } from 'zod';

// Reusable field schemas
const emailSchema = z.email('Invalid email address').trim().toLowerCase().max(150, 'Email must be less than 150 characters');

export const basePasswordSchema = z.string().trim().min(1, 'Password is required');

export const strongPasswordSchema = z
  .string()
  .trim()
  .min(8, 'Password must be at least 8 characters')
  .max(50, 'Password must be less than 50 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const otpSchema = z.string().trim().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits');

// Schemas
export const signupSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(30, 'Name must be less than 30 characters'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: basePasswordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Reset token is required'),
  password: strongPasswordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(1, 'Verify email token is required'),
  otp: otpSchema,
});

export const resendOTPSchema = z.object({
  token: z.string().trim().min(1, 'Verify email token is required'),
});

// Types
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendOTPInput = z.infer<typeof resendOTPSchema>;
