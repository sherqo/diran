'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { ApiResult } from '@/shared/types/api';
import { User } from '@/shared/types/user';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<ApiResult>;
    signup: (email: string, password: string, name: string) => Promise<ApiResult>;
    verifyEmail: (email: string, otp: string) => Promise<ApiResult>;
    resendOTP: (email: string) => Promise<ApiResult>;
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
        const result = await authApi.getProfile();

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
        const result = await authApi.login(email, password);

        // Handle successful login
        if (result.success && result.data?.user) {
            setUser(result.data.user);
        }

        return result;
    };

    const signup = async (email: string, password: string, name: string) => {
        return await authApi.signup(email, password, name);
    };

    const verifyEmail = async (email: string, otp: string) => {
        const result = await authApi.verifyEmail(email, otp);

        if (result.success) {
            // After successful verification, refresh user data
            await checkAuth();
        }

        return result;
    };

    const resendOTP = async (email: string) => {
        return await authApi.resendOTP(email);
    };

    const logout = async () => {
        await authApi.logout();
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
