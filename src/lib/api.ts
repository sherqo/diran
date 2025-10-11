const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003/v1';

// Backend response types (matching your backend exactly)
export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

export interface ErrorResponse {
    success: false;
    error: {
        message: string;
        code?: string;
    };
}

export interface User {
    id: string;
    email: string;
    name: string;
    photo?: string;
    createdAt: string;
}

export interface LoginData {
    user: User;
    requiresVerification?: boolean;
}

export interface SignupData {
    user: User;
}

export interface VerifyEmailData {
    message: string;
}

// Standardized API result interface
export interface ApiResult<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    requiresVerification?: boolean;
}

export class AuthApiError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number
    ) {
        super(message);
        this.name = 'AuthApiError';
    }
}

// Generic API request function with centralized error handling
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResult<T>> {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            credentials: 'include', // Important: includes cookies
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.error?.message || 'Something went wrong',
            };
        }

        // Success - return backend data with normalized structure
        return {
            success: true,
            data,
            message: data.message,
        };
    } catch {
        // Network or other unexpected errors
        return {
            success: false,
            message: 'Network error occurred',
        };
    }
}

// Auth API functions - all return ApiResult
export const authApi = {
    // Login user
    async login(email: string, password: string): Promise<ApiResult<SuccessResponse<LoginData>>> {
        return await apiRequest<SuccessResponse<LoginData>>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    // Signup user
    async signup(email: string, password: string, name: string): Promise<ApiResult<SuccessResponse<SignupData>>> {
        return await apiRequest<SuccessResponse<SignupData>>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
    },

    // Verify email with OTP
    async verifyEmail(email: string, otp: string): Promise<ApiResult<SuccessResponse<null>>> {
        return await apiRequest<SuccessResponse<null>>('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        });
    },

    // Resend OTP
    async resendOTP(email: string): Promise<ApiResult<SuccessResponse<null>>> {
        return await apiRequest<SuccessResponse<null>>('/auth/resend-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    // Logout user
    async logout(): Promise<ApiResult<SuccessResponse<Record<string, never>>>> {
        return await apiRequest<SuccessResponse<Record<string, never>>>('/auth/logout', {
            method: 'POST',
        });
    },

    // Get current user profile
    async getProfile(): Promise<ApiResult<SuccessResponse<{ user: User }>>> {
        return await apiRequest<SuccessResponse<{ user: User }>>('/user/profile');
    },

    // Refresh access token
    async refresh(): Promise<ApiResult<SuccessResponse<Record<string, never>>>> {
        return await apiRequest<SuccessResponse<Record<string, never>>>('/auth/refresh', {
            method: 'POST',
        });
    },
};
