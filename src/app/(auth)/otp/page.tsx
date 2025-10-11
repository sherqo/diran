import { OTPForm } from '@/components/auth/otp-form';

export const metadata = {
    title: 'Verify Email',
};

type PageProps = {
    searchParams: Promise<{
        email?: boolean;
    }>;
};

export default async function OTPPage({ searchParams }: PageProps) {
    const { email } = await searchParams;

    if (!email || typeof email !== 'string') {
        return <div className="p-4">Invalid access. Please use the link sent to your email.</div>;
    }

    return <OTPForm email={email} />;
}
