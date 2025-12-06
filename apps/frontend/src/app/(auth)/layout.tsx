import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthRedirect } from '@/components/auth/AuthRedirect';
import { ThemeProvider } from 'next-themes';
import { CenteredLayout } from '@/components/ui/centered-layout';

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <body>
            <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
                <AuthProvider>
                    <AuthRedirect>
                        <CenteredLayout>{children}</CenteredLayout>
                    </AuthRedirect>
                </AuthProvider>
            </ThemeProvider>
        </body>
    );
}
