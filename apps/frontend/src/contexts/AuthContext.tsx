'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { ApiResult } from '@/shared/types/api';
import { User } from '@/shared/types/user';
import { getProfileApi, loginApi, logoutApi, resendOTPApi, signupApi, verifyEmailApi } from '@/lib/api/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<ApiResult>;
    signup: (email: string, password: string, name: string) => Promise<ApiResult>;
    verifyEmail: (token: string, otp: string) => Promise<ApiResult>;
    resendOTP: (token: string) => Promise<ApiResult>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check authentication status on mount
    const checkAuth = async () => {
        setLoading(true);
        const result = await getProfileApi();

        if (result.success && result.data?.user) {
            setUser(result.data.user);
        } else {
            setUser(null);
        }

        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const result = await loginApi(email, password);

        // Handle successful login
        if (result.success && result.data?.user) {
            setUser(result.data.user);
        }

        return result;
    };

    const signup = async (email: string, password: string, name: string) => {
        return await signupApi(email, password, name);
    };

    const verifyEmail = async (token: string, otp: string) => {
        const result = await verifyEmailApi(token, otp);

        if (result.success) {
            // After successful verification, refresh user data
            await checkAuth();
        }

        return result;
    };

    const resendOTP = async (token: string) => {
        return await resendOTPApi(token);
    };

    const logout = async () => {
        await logoutApi();
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        signup,
        verifyEmail,
        resendOTP,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
