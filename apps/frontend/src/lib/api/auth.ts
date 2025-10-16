import { LoginData, SignupData, User } from '@/shared/types/user';
import { apiRequest } from './helpers';

export const loginApi = (email: string, password: string) =>
    apiRequest<LoginData>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

export const signupApi = (email: string, password: string, name: string) =>
    apiRequest<SignupData>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });

export const verifyEmailApi = (token: string, otp: string) =>
    apiRequest<null>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token, otp }),
    });

export const resendOTPApi = (token: string) =>
    apiRequest<null>('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ token }),
    });

export const forgotPasswordApi = (email: string) =>
    apiRequest<null>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });

export const resetPasswordApi = (token: string, password: string) =>
    apiRequest<{ email: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
    });

export const logoutApi = () => apiRequest<Record<string, never>>('/auth/logout', { method: 'POST' });

export const getProfileApi = () => apiRequest<{ user: User }>('/user/profile');
