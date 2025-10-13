import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login',
    description: "Login to access Diran AI's next-generation note-taking and productivity app",
};

export default function LoginPage() {
    return <LoginForm />;
}
