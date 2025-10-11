'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function ProfileClientPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-primary h-8 w-8 animate-spin rounded-full border-b-2 border-current" />
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect to login
    }

    return (
        <div className="bg-background min-h-screen py-16">
            <div className="mx-auto max-w-2xl px-6">
                <div className="border-border bg-card overflow-hidden rounded-lg border p-8 shadow-sm">
                    <div className="mb-8 text-center">
                        <div className="bg-sidebar-primary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                            <span className="text-sidebar-primary-foreground text-2xl font-bold">
                                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <h1 className="text-foreground mb-2 text-2xl font-bold">Welcome, {user.name}!</h1>
                        <p className="text-muted-foreground">Your profile information</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-muted-foreground mb-1 block text-sm font-medium">Name</label>
                            <div className="border-border bg-popover text-card-foreground rounded-md border p-3">{user.name}</div>
                        </div>

                        <div>
                            <label className="text-muted-foreground mb-1 block text-sm font-medium">Email</label>
                            <div className="border-border bg-popover text-card-foreground rounded-md border p-3">{user.email}</div>
                        </div>

                        <div>
                            <label className="text-muted-foreground mb-1 block text-sm font-medium">User ID</label>
                            <div className="border-border bg-popover text-card-foreground rounded-md border p-3 font-mono text-sm">
                                {user.id}
                            </div>
                        </div>

                        <div>
                            <label className="text-muted-foreground mb-1 block text-sm font-medium">Member Since</label>
                            <div className="border-border bg-popover text-card-foreground rounded-md border p-3">
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
