import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
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
                    <ProtectedRoute>{children}</ProtectedRoute>
                </AuthProvider>
            </ThemeProvider>
        </body>
    );
}
