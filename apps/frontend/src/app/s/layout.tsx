import { ThemeProvider } from 'next-themes';

export default function PublishedLayout({ children }: { children: React.ReactNode }) {
    return (
        <body className="bg-background min-h-screen antialiased" suppressHydrationWarning>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
            </ThemeProvider>
        </body>
    );
}
