'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SITE_NAME } from '@/lib/site';
import Link from 'next/link';
import AuthFooter from './auth-footer';
import { authApi } from '@/lib/api';

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [token, setToken] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setMessage('Invalid reset link. No token provided.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            setLoading(false);
            return;
        }

        if (!token) {
            setMessage('Invalid reset token.');
            setLoading(false);
            return;
        }

        const result = await authApi.resetPassword(token, password);

        if (result.success) {
            setMessage('Password reset successfully. Redirecting to login...');
            setTimeout(() => router.push('/login'), 2000);
        } else {
            setMessage(result.error?.message || 'Something went wrong.');
        }

        setLoading(false);
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <form onSubmit={handleSubmit}>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-xl font-medium">
                            Reset Password for <span className="font-clash">{SITE_NAME}</span>
                        </h1>
                        <FieldDescription>
                            Enter your new password. <Link href="/login">Back to login</Link>
                        </FieldDescription>
                    </div>

                    {message && (
                        <div
                            className={cn(
                                'rounded-md p-3 text-sm',
                                message.includes('successfully')
                                    ? 'border border-green-200 bg-green-50 text-green-700'
                                    : 'border border-red-200 bg-red-50 text-red-700'
                            )}>
                            {message}
                        </div>
                    )}

                    <Field>
                        <FieldLabel htmlFor="password">New Password</FieldLabel>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </Field>
                    <Field>
                        <Button type="submit" disabled={loading || !token}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
            <AuthFooter />
        </div>
    );
}
