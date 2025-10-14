import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Forgot Password',
    description: 'Reset your password for Diran AI',
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}
