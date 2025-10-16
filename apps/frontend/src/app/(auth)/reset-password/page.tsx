import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reset Password',
    description: 'Reset your password for Diran AI',
};

type PageProps = {
    searchParams: Promise<{
        token?: string;
    }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const token = params.token;

    if (!token || typeof token !== 'string') {
        return <div className="p-4">Invalid or expired reset link.</div>;
    }

    return <ResetPasswordForm token={token} />;
}
