import { User } from './user';

export interface AuthUser {
  id: string;
}

// New API Response Data Types
export interface SignupResponseData {
  emailToken: string;
}

export interface LoginResponseData {
  user: User;
}

export interface LoginErrorData {
  emailToken?: string;
}

export type ForgotPasswordResponseData = {};

export interface ResetPasswordResponseData {
  email: string;
}

export type VerifyEmailResponseData = {};

export type RefreshResponseData = {};

export interface ResendOTPResponseData {
  emailToken: string;
}

export type LogoutResponseData = {};
