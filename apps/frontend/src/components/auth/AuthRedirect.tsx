'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '../ui/loader';

interface AuthRedirectProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function AuthRedirect({ children, redirectTo = '/home' }: AuthRedirectProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push(redirectTo);
        }
    }, [loading, user, router, redirectTo]);

    // Show loading spinner while checking auth
    if (loading) {
        <div className="flex min-h-screen items-center justify-center">
            <Loader />
        </div>;
    }

    // Don't render auth forms if already authenticated
    if (user) {
        return null;
    }

    return <>{children}</>;
}
