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

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { signup } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const result = await signup(email, password, name);

        if (result.success) {
            setMessage(result.message || '');
            // Redirect to OTP page with email parameter
            setTimeout(() => {
                router.push(`/otp?email=${encodeURIComponent(email)}`);
            }, 1500);
        } else {
            setMessage(result.message || '');
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
                        <Input id="name" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            placeholder="xx@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
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
                        <Button type="submit" disabled={loading}>
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
