import type { Metadata } from 'next';
import Image from 'next/image';
import logo from '@/imgs/logo-192.png';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Diran AI',
    description: "Login or sign up to access Diran AI's next-generation note-taking and productivity app",
};

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="bg-background container mx-auto flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <Button variant="ghost" className="absolute top-2 left-4 flex items-center gap-2 rounded-lg px-2">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/identity/logo-192.png" alt="Diran AI" width={30} height={30} />
                    <span className="font-clash font-lg">Diran AI</span>
                </Link>
            </Button>
            <div className="w-full max-w-sm">{children}</div>
        </div>
    );
}
