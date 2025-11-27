'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { PageProvider } from '@/contexts/PageContext';
import { CommandPalette } from '@/components/command-palette';
import { ThemeProvider } from 'next-themes';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <body>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <AuthProvider>
                    <ProtectedRoute>
                        <PageProvider>
                            <SidebarProvider>
                                <AppSidebar />
                                <SidebarInset className="flex h-screen flex-col">{children}</SidebarInset>
                            </SidebarProvider>
                            <CommandPalette />
                        </PageProvider>
                    </ProtectedRoute>
                </AuthProvider>
            </ThemeProvider>
        </body>
    );
}
