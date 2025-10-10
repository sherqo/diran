import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import '@fontsource-variable/inter';
import StructuredData from '@/components/seo/StructuredData';

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
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/identity/favicon-32x32.png" sizes="32x32" />
                <link rel="icon" href="/identity/favicon-16x16.png" sizes="16x16" />
                <link rel="apple-touch-icon" href="/identity/apple-touch-icon.png" />
                <meta name="theme-color" content="#f97316" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="Diran AI" />
                <StructuredData />
            </head>
            <body className="flex min-h-screen flex-col">
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
