'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function AuthStatus() {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-400"></div>
                Loading...
            </div>
        );
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">Hello, {user.name}!</span>
                <Link href="/profile">
                    <Button variant="outline" size="sm">
                        Profile
                    </Button>
                </Link>
                <Button onClick={logout} variant="ghost" size="sm">
                    Logout
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Link href="/login">
                <Button variant="outline" size="sm">
                    Login
                </Button>
            </Link>
            <Link href="/signup">
                <Button size="sm">Sign up</Button>
            </Link>
        </div>
    );
}
