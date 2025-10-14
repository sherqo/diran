const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003/v1';

import type { ApiResult, SuccessResponse, ErrorResponse, User, LoginData, SignupData } from '@/shared';

// --- Helpers ---
async function doFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;
    return fetch(url, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });
}

async function parseJsonSafe<T>(res: Response): Promise<ApiResult<T>> {
    try {
        const data = await res.json();
        return data as ApiResult<T>;
    } catch {
        return {
            success: false,
            error: { message: 'Invalid JSON from server', code: 'INVALID_JSON' },
        };
    }
}

export async function refreshAccessToken(headers?: HeadersInit): Promise<boolean> {
    // Forward headers (e.g. Cookie) when attempting refresh - important on server/middleware
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await doFetch('/auth/refresh', { method: 'POST', headers: { ...(headers as any) } });
    if (!res.ok) return false;

    const data = await parseJsonSafe<null>(res);
    return (data as SuccessResponse<null>).success === true;
}

// --- Core API Request ---
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResult<T>> {
    try {
        let res = await doFetch(endpoint, options);
        let data = await parseJsonSafe<T>(res);

        if (!res.ok) {
            const error = data as ErrorResponse;
            const needsRefresh = endpoint !== '/auth/refresh' && error.error?.code === 'ACCESS_TOKEN_REQUIRED';

            if (needsRefresh && (await refreshAccessToken())) {
                res = await doFetch(endpoint, options);
                data = await parseJsonSafe<T>(res);
            }
        }

        return data;
    } catch {
        return {
            success: false,
            error: { message: 'Network error occurred', code: 'NETWORK_ERROR' },
        };
    }
}

// --- Auth API Wrapper ---
export const authApi = {
    login: (email: string, password: string) =>
        apiRequest<LoginData>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    signup: (email: string, password: string, name: string) =>
        apiRequest<SignupData>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        }),

    verifyEmail: (email: string, otp: string) =>
        apiRequest<null>('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        }),

    resendOTP: (email: string) =>
        apiRequest<null>('/auth/resend-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),

    logout: () => apiRequest<Record<string, never>>('/auth/logout', { method: 'POST' }),

    getProfile: () => apiRequest<{ user: User }>('/user/profile'),
};
