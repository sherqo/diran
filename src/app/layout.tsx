import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import '@fontsource-variable/inter';

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
        <html lang="en" suppressHydrationWarning>
            <body className="flex h-screen flex-col">
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
