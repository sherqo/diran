'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '../ui/loader';

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push(redirectTo);
        }
    }, [loading, user, router, redirectTo]);

    // While loading we still render children but dim them and overlay a centered loader
    // If not authenticated and not loading, don't render protected content
    if (!user && !loading) {
        return null;
    }

    return (
        <div className="relative min-h-screen">
            {/* children are visible; when loading they get dimmed and interaction is disabled */}
            <div className={'h-full w-full'}>{children}</div>
        </div>
    );
}
