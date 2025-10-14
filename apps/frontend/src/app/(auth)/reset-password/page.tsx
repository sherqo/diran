import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reset Password',
    description: 'Reset your password for Diran AI',
};

export default function ResetPasswordPage() {
    return <ResetPasswordForm />;
}
