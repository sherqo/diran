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
import { SITE_NAME } from '@/lib/site';
import Link from 'next/link';
import AuthFooter from './auth-footer';
// import GoogleBtn from './google-btn';
import { useAuth } from '@/contexts/AuthContext';
import { signupSchema } from '@/shared/validation/auth';
import { useFormValidation } from '@/hooks/useFormValidation';

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.'
    );
    const [isError, setIsError] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();

    const { errorMessage, validate, clearFieldError, hasErrors } = useFormValidation(signupSchema);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        clearFieldError();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        // Validate form data using shared schema
        const validationResult = validate(formData);
        if (!validationResult.success) {
            setLoading(false);
            return;
        }

        const result = await signup(formData.email, formData.password, formData.name);

        if (result.success) {
            setMessage(result.message || 'Account created successfully!');
            setIsError(false);
            // Use the JWT token from server response instead of raw email
            if (result.data?.emailToken) {
                router.push(`/otp?verifyEmailToken=${result.data.emailToken}`);
            }
        } else {
            setMessage(result.error.message || 'Something went wrong');
            setIsError(true);
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

                    {(message || errorMessage) && (
                        <div
                            className={cn(
                                'rounded-md p-3 text-sm',
                                !isError && !errorMessage
                                    ? 'border border-green-200 bg-green-50 text-green-700'
                                    : 'border border-red-200 bg-red-50 text-red-700'
                            )}>
                            {message || errorMessage}
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
                    </Field>

                    <Field>
                        <Button type="submit" disabled={loading || hasErrors}>
                            {loading ? 'Creating account...' : 'Sign up'}
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
