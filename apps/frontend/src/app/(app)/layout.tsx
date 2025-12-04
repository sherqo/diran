import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { PageProvider } from '@/contexts/PageContext';
import { EditorProvider } from '@/contexts/EditorContext';
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
                            <EditorProvider>
                                <SidebarProvider>
                                    <AppSidebar />
                                    <SidebarInset className="flex h-screen flex-col">{children}</SidebarInset>
                                </SidebarProvider>
                                <CommandPalette />
                            </EditorProvider>
                        </PageProvider>
                    </ProtectedRoute>
                </AuthProvider>
            </ThemeProvider>
        </body>
    );
}
