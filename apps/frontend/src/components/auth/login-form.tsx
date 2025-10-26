'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    // FieldSeparator
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SITE_NAME } from '@/lib/site-info';
import Link from 'next/link';
import AuthFooter from './auth-footer';
// import GoogleBtn from './google-btn';
import { useAuth } from '@/contexts/AuthContext';
import { loginBodySchema } from '@/shared/validation/auth';
import { useFormValidation } from '@/hooks/useFormValidation';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const { errorMessage, validate, clearFieldError, hasErrors } = useFormValidation(loginBodySchema);

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

        const result = await login(formData.email, formData.password);

        if (result.success) {
            router.push('/home'); // Redirect to home page
        } else {
            // If email verification is required, redirect to OTP page
            if (result.error?.code === 'EMAIL_NOT_VERIFIED' && result.data?.emailToken) {
                router.push(`/otp?verifyEmailToken=${result.data.emailToken}`);
            }
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
                            Don&apos;t have an account? <Link href="/signup">Sign up</Link>
                        </FieldDescription>
                    </div>

                    {(message || errorMessage) && (
                        <div
                            className={cn(
                                'rounded-md p-3 text-sm',
                                message && (message.includes('successful') || message.includes('verification'))
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
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => handleInputChange('password', e.target.value)}
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
                        <FieldDescription className="text-right">
                            <Link href="/forgot-password">Forgot password?</Link>
                        </FieldDescription>
                    </Field>
                    <Field>
                        <Button type="submit" disabled={loading || hasErrors}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </Field>
                    {/* <FieldSeparator>Or</FieldSeparator> */}

                    {/* <GoogleBtn /> */}
                </FieldGroup>
            </form>
            <AuthFooter />
        </div>
    );
}
