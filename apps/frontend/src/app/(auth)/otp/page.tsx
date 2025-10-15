import { OTPForm } from '@/components/auth/otp-form';
import { decodeEmailFromToken, isJWTToken } from '@/lib/jwt-utils';

export const metadata = {
    title: 'Verify Email',
};

type PageProps = {
    searchParams: Promise<{
        verifyEmailToken?: string;
    }>;
};

export default async function OTPPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const verifyEmailToken = params.verifyEmailToken;

    if (!verifyEmailToken || typeof verifyEmailToken !== 'string') {
        return <div className="p-4">Invalid access. Please try to login again</div>;
    }

    // Check if it's a JWT token or regular email
    let actualEmail: string;
    if (isJWTToken(verifyEmailToken)) {
        const decodedEmail = decodeEmailFromToken(verifyEmailToken);
        if (!decodedEmail) {
            return <div className="p-4">Invalid or expired verification link.</div>;
        }
        actualEmail = decodedEmail;
    } else {
        return <div className="p-4">Invalid access. Please try to login again</div>;
    }

    return <OTPForm email={actualEmail} verifyEmailToken={verifyEmailToken} />;
}
