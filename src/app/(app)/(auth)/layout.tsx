import type { Metadata } from 'next';

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
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">{children}</div>
        </div>
    );
}
