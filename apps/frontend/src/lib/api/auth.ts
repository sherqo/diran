import {
    ForgotPasswordBodyInput,
    LoginBodyInput,
    ResendOTPBodyInput,
    ResetPasswordBodyInput,
    SignupBodyInput,
    VerifyEmailBodyInput,
} from '@/shared/validation/auth';
import { apiRequest } from './helpers';
import type {
    SignupResponseData,
    LoginResponseData,
    ForgotPasswordResponseData,
    ResetPasswordResponseData,
    VerifyEmailResponseData,
    ResendOTPResponseData,
    LogoutResponseData,
} from '@/shared/types/auth';

export const loginApi = ({ email, password }: LoginBodyInput) =>
    apiRequest<LoginResponseData>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

export const signupApi = ({ email, password, name }: SignupBodyInput) =>
    apiRequest<SignupResponseData>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });

export const verifyEmailApi = ({ token, otp }: VerifyEmailBodyInput) =>
    apiRequest<VerifyEmailResponseData>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token, otp }),
    });

export const resendOTPApi = ({ token }: ResendOTPBodyInput) =>
    apiRequest<ResendOTPResponseData>('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ token }),
    });

export const forgotPasswordApi = ({ email }: ForgotPasswordBodyInput) =>
    apiRequest<ForgotPasswordResponseData>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });

export const resetPasswordApi = ({ token, password }: ResetPasswordBodyInput) =>
    apiRequest<ResetPasswordResponseData>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
    });

export const logoutApi = () => apiRequest<LogoutResponseData>('/auth/logout', { method: 'POST' });
