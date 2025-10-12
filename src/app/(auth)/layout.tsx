import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { SITE_NAME } from '@/lib/site';
import { AuthRedirect } from '@/components/auth/AuthRedirect';
import { ThemeProvider } from 'next-themes';

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
                        <div className="bg-background container mx-auto flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                            <Button variant="ghost" className="absolute top-2 left-4 flex items-center gap-2 rounded-lg px-2">
                                <Link href="/" className="flex items-center gap-2">
                                    <Image src="/identity/logo-192.png" alt={`${SITE_NAME} logo`} width={30} height={30} />
                                    <span className="font-clash font-lg">{SITE_NAME}</span>
                                </Link>
                            </Button>
                            <div className="w-full max-w-sm">{children}</div>
                        </div>
                    </AuthRedirect>
                </AuthProvider>
            </ThemeProvider>
        </body>
    );
}
