import type { Metadata } from 'next';
import './globals.css';
import '@fontsource-variable/inter';
import { SITE_NAME } from '@/lib/site-info';

export const metadata: Metadata = {
    title: {
        default: `${SITE_NAME} | Better Decisions.`,
        template: `${SITE_NAME} | %s`,
    },
    description: 'Your AI-powered next-generation note-taking and productivity app',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            {children}
        </html>
    );
}
