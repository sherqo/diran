'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    const { errorMessage, validate, clearFieldError, hasErrors } = useFormValidation(resetPasswordSchema);

    // Derive token from searchParams and formData from current state
    const token = searchParams.get('token') || '';
    const formData = { token, password };

    // Derive initial error message for missing token
    const initialError = !token ? 'Invalid reset link. No token provided.' : '';

    // Use the initial error if no other message is set
    const displayMessage = message || initialError;

    const handleInputChange = (value: string) => {
        setPassword(value);
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

        if (!token) {
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

    const isFormValid = !hasErrors && password && token;

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

                    {(displayMessage || errorMessage) && (
                        <div
                            className={cn(
                                'rounded-md p-3 text-sm',
                                displayMessage && displayMessage.includes('successfully')
                                    ? 'border border-green-200 bg-green-50 text-green-700'
                                    : 'border border-red-200 bg-red-50 text-red-700'
                            )}>
                            {displayMessage || errorMessage}
                        </div>
                    )}

                    <Field>
                        <FieldLabel htmlFor="password">New Password</FieldLabel>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => handleInputChange(e.target.value)}
                                required
                                className="pr-12"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute top-1/2 right-2 -translate-y-1/2 p-2 focus:outline-none">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
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
