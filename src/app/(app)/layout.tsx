import { AuthProvider } from '@/contexts/AuthContext';
import { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
    title: 'Diran AI',
    description: 'Your AI-powered next-generation note-taking and productivity app',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <body>
            <AuthProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </AuthProvider>
        </body>
    );
}
