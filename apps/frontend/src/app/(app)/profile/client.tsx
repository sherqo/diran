'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileClientPage() {
    const { user, loading, logout, checkAuth } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="bg-background min-h-screen py-16">
                <div className="mx-auto max-w-2xl px-6">
                    <div className="border-border bg-card overflow-hidden rounded-lg border p-8 shadow-sm">
                        <div className="mb-8 text-center">
                            <Skeleton className="mx-auto mb-4 h-20 w-20 rounded-full" />
                            <Skeleton className="mx-auto mb-2 h-8 w-48" />
                            <Skeleton className="mx-auto h-4 w-32" />
                        </div>
                        <div className="space-y-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i}>
                                    <Skeleton className="mb-2 h-4 w-16" />
                                    <Skeleton className="h-12 w-full rounded-md" />
                                </div>
                            ))}
                            <div className="border-t pt-6">
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen py-16">
            <div className="mx-auto max-w-2xl px-6">
                <div className="border-border bg-card overflow-hidden rounded-lg border p-8 shadow-sm">
                    <div className="mb-8 text-center">
                        <div className="bg-sidebar-primary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                            <span className="text-sidebar-primary-foreground text-2xl font-bold">
                                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        <Button
                            onClick={checkAuth}
                            variant="ghost"
                            className="absolute top-2 left-4 flex items-center gap-2 rounded-lg px-2">
                            HELLO HELLO
                        </Button>

                        <h1 className="text-foreground mb-2 text-2xl font-bold">Welcome, {user?.name}!</h1>
                        <p className="text-muted-foreground">Your profile information</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-muted-foreground mb-1 block text-sm font-medium">Name</label>
                            <div className="border-border bg-popover text-card-foreground rounded-md border p-3">{user?.name}</div>
                        </div>
                        <div>
                            <label className="text-muted-foreground mb-1 block text-sm font-medium">Email</label>
                            <div className="border-border bg-popover text-card-foreground rounded-md border p-3">{user?.email}</div>
                        </div>
                        <div>
                            <label className="text-muted-foreground mb-1 block text-sm font-medium">User ID</label>
                            <div className="border-border bg-popover text-card-foreground rounded-md border p-3 font-mono text-sm">
                                {user?.id}
                            </div>
                        </div>
                        {user && (
                            <div>
                                <label className="text-muted-foreground mb-1 block text-sm font-medium">Member Since</label>
                                <div className="border-border bg-popover text-card-foreground rounded-md border p-3">
                                    {new Date(user.createdAt as string).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                            </div>
                        )}
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
