import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { PageProvider } from '@/contexts/PageContext';
import { CommandPalette } from '@/components/command-palette';
import { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function RootLayout({
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
                            {children}
                            <CommandPalette />
                        </PageProvider>
                    </ProtectedRoute>
                </AuthProvider>
            </ThemeProvider>
        </body>
    );
}
