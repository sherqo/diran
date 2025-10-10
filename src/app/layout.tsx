import type { Metadata } from 'next';
import './globals.css';
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
            {children}
        </html>
    );
}
