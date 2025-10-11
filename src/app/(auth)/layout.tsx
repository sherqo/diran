import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
    title: 'Diran AI - Authentication',
    description: 'Sign in or create an account to access Diran AI',
};

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <body>
            <AuthProvider>
                <div className="bg-background container mx-auto flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                    <Button variant="ghost" className="absolute top-2 left-4 flex items-center gap-2 rounded-lg px-2">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/identity/logo-192.png" alt="Diran AI" width={30} height={30} />
                            <span className="font-clash font-lg">Diran AI</span>
                        </Link>
                    </Button>
                    <div className="w-full max-w-sm">{children}</div>
                </div>
            </AuthProvider>
        </body>
    );
}
