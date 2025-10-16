'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SITE_NAME } from '@/lib/site-info';
import Link from 'next/link';
import AuthFooter from './auth-footer';

import { forgotPasswordSchema } from '@/shared/validation/auth';
import { useFormValidation } from '@/hooks/useFormValidation';
import { forgotPasswordApi } from '@/lib/api/auth';

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
    const [formData, setFormData] = useState({ email: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(0);

    const { errorMessage, validate, clearFieldError, hasErrors } = useFormValidation(forgotPasswordSchema);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

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

        const result = await forgotPasswordApi(formData.email);

        if (result.success) {
            setMessage(`if the email ${formData.email} is registered, a reset link has been sent.`);
            setCountdown(60); // 1 minute
        } else {
            setMessage(result.error?.message || 'Something went wrong.');
        }

        setLoading(false);
    };

    const isDisabled = loading || countdown > 0;

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <form onSubmit={handleSubmit}>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-xl font-medium">
                            Forgot Password for <span className="font-clash">{SITE_NAME}</span>
                        </h1>
                        <FieldDescription>
                            Enter your email to receive a reset link. <Link href="/login">Back to login</Link>
                        </FieldDescription>
                    </div>

                    {(message || errorMessage) && (
                        <div
                            className={cn(
                                'rounded-md p-3 text-sm',
                                message && message.includes('sent')
                                    ? 'border border-green-200 bg-green-50 text-green-700'
                                    : 'border border-red-200 bg-red-50 text-red-700'
                            )}>
                            {message || errorMessage}
                        </div>
                    )}

                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            placeholder="xx@example.com"
                            value={formData.email}
                            onChange={e => handleInputChange('email', e.target.value)}
                            required
                        />
                    </Field>
                    <Field>
                        <Button type="submit" disabled={isDisabled || hasErrors}>
                            {loading ? 'Sending...' : countdown > 0 ? `Send again in ${countdown}s` : 'Send Reset Link'}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
            <AuthFooter />
        </div>
    );
}
