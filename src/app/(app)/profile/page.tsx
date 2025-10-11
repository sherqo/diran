'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect to login
    }

    return (
        <div className="min-h-screen bg-gray-50 py-16">
            <div className="mx-auto max-w-2xl px-6">
                <div className="rounded-lg border bg-white p-8 shadow-sm">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600">
                            <span className="text-2xl font-bold text-white">
                                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <h1 className="mb-2 text-2xl font-bold text-gray-900">Welcome, {user.name}!</h1>
                        <p className="text-gray-600">Your profile information</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                            <div className="rounded-md border bg-gray-50 p-3">{user.name}</div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                            <div className="rounded-md border bg-gray-50 p-3">{user.email}</div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">User ID</label>
                            <div className="rounded-md border bg-gray-50 p-3 font-mono text-sm">{user.id}</div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Member Since</label>
                            <div className="rounded-md border bg-gray-50 p-3">
                                {new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <Button onClick={handleLogout} className="w-full" variant="destructive">
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
