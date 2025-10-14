'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SITE_NAME } from '@/lib/site';
import Link from 'next/link';
import AuthFooter from './auth-footer';
import GoogleBtn from './google-btn';
import { useAuth } from '@/contexts/AuthContext';
import { signupSchema } from '@/shared/validation/auth';
import { useFormValidation } from '@/hooks/useFormValidation';

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { signup } = useAuth();
    const router = useRouter();

    const { errors, validate, clearFieldError, hasErrors } = useFormValidation(signupSchema);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        clearFieldError(field);
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

        const result = await signup(formData.email, formData.password, formData.name);

        if (result.success) {
            setMessage(result.message || '');
            router.push(`/otp?email=${encodeURIComponent(formData.email)}`);
        } else {
            setMessage(result.error.message || '');
        }

        setLoading(false);
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <form onSubmit={handleSubmit}>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-xl font-medium">
                            Welcome to <span className="font-clash">{SITE_NAME}</span>
                        </h1>
                        <FieldDescription>
                            Already have an account? <Link href="/login">Log in</Link>
                        </FieldDescription>
                    </div>

                    {message && (
                        <div
                            className={cn(
                                'rounded-md p-3 text-sm',
                                message.includes('successful') || message.includes('created')
                                    ? 'border border-green-200 bg-green-50 text-green-700'
                                    : 'border border-red-200 bg-red-50 text-red-700'
                            )}>
                            {message}
                        </div>
                    )}

                    <Field>
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={e => handleInputChange('name', e.target.value)}
                            required
                        />
                        {errors.name && <FieldDescription className="mt-1 text-sm text-red-600">{errors.name}</FieldDescription>}
                    </Field>
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
                        {errors.email && <FieldDescription className="mt-1 text-sm text-red-600">{errors.email}</FieldDescription>}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={e => handleInputChange('password', e.target.value)}
                            required
                        />
                        {errors.password && <FieldDescription className="mt-1 text-sm text-red-600">{errors.password}</FieldDescription>}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={e => handleInputChange('confirmPassword', e.target.value)}
                            required
                        />
                        {errors.confirmPassword && (
                            <FieldDescription className="mt-1 text-sm text-red-600">{errors.confirmPassword}</FieldDescription>
                        )}
                    </Field>
                    <Field>
                        <Button type="submit" disabled={loading || hasErrors}>
                            {loading ? 'Creating account...' : 'Sign up'}
                        </Button>
                    </Field>
                    <FieldSeparator>Or</FieldSeparator>

                    <GoogleBtn />
                </FieldGroup>
            </form>
            <AuthFooter />
        </div>
    );
}
