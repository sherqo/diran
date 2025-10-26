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
export const signupBodySchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(30, 'Name must be less than 30 characters'),
});

export const loginBodySchema = z.object({
  email: emailSchema,
  password: basePasswordSchema,
});

export const forgotPasswordBodySchema = z.object({
  email: emailSchema,
});

export const resetPasswordBodySchema = z.object({
  token: z.string().trim().min(1, 'Reset token is required'),
  password: strongPasswordSchema,
});

export const verifyEmailBodySchema = z.object({
  token: z.string().trim().min(1, 'Verify email token is required'),
  otp: otpSchema,
});

export const resendOTPBodySchema = z.object({
  token: z.string().trim().min(1, 'Verify email token is required'),
});

// Types
export type SignupBodyInput = z.infer<typeof signupBodySchema>;
export type LoginBodyInput = z.infer<typeof loginBodySchema>;
export type ForgotPasswordBodyInput = z.infer<typeof forgotPasswordBodySchema>;
export type ResetPasswordBodyInput = z.infer<typeof resetPasswordBodySchema>;
export type VerifyEmailBodyInput = z.infer<typeof verifyEmailBodySchema>;
export type ResendOTPBodyInput = z.infer<typeof resendOTPBodySchema>;
