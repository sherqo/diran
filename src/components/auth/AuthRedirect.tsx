'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRedirectProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function AuthRedirect({ children, redirectTo = '/profile' }: AuthRedirectProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push(redirectTo);
        }
    }, [loading, user, router, redirectTo]);

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
        );
    }

    // Don't render auth forms if already authenticated
    if (user) {
        return null;
    }

    return <>{children}</>;
}
