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
import { resetPasswordSchema } from '@/shared/validation/auth';
import { useFormValidation } from '@/hooks/useFormValidation';

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
    const [formData, setFormData] = useState({ token: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    const { errorMessage, validate, clearFieldError, hasErrors } = useFormValidation(resetPasswordSchema);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (tokenParam) {
            setFormData(prev => ({ ...prev, token: tokenParam }));
        } else {
            setMessage('Invalid reset link. No token provided.');
        }
    }, [searchParams]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        clearFieldError();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Validate form data using shared schema
        const validationResult = validate(formData);
        if (!validationResult.success) {
            setLoading(false);
            return;
        }

        if (!formData.token) {
            setMessage('Invalid reset token.');
            setLoading(false);
            return;
        }

        const result = await authApi.resetPassword(formData.token, formData.password);

        if (result.success) {
            const userEmail = result.data?.email || 'your email';
            setMessage(`Password reset successfully for ${userEmail}. Redirecting to your profile...`);
            router.push('/profile');
        } else {
            setMessage(result.error?.message || 'Something went wrong.');
        }

        setLoading(false);
    };

    const isFormValid = !hasErrors && formData.password && formData.token;

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

                    {(message || errorMessage) && (
                        <div
                            className={cn(
                                'rounded-md p-3 text-sm',
                                message && message.includes('successfully')
                                    ? 'border border-green-200 bg-green-50 text-green-700'
                                    : 'border border-red-200 bg-red-50 text-red-700'
                            )}>
                            {message || errorMessage}
                        </div>
                    )}

                    <Field>
                        <FieldLabel htmlFor="password">New Password</FieldLabel>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={e => handleInputChange('password', e.target.value)}
                            required
                        />
                    </Field>

                    <Field>
                        <Button type="submit" disabled={loading || !isFormValid}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
            <AuthFooter />
        </div>
    );
}
