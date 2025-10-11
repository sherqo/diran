'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import AuthFooter from './auth-footer';
import { useAuth } from '@/contexts/AuthContext';

export function OTPForm({ className, email, ...props }: React.ComponentProps<'div'> & { email: string }) {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const { verifyEmail, resendOTP } = useAuth();
    const router = useRouter();

    // Get email from URL params (passed from signup/login)

    useEffect(() => {
        if (!email) {
            // If no email in URL, redirect to login
            router.push('/login');
        }
    }, [email, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setMessage('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);
        setMessage('');

        const result = await verifyEmail(email, otp);

        if (result.success) {
            setMessage(result.message || '');
            // Redirect to profile after verification
            setTimeout(() => {
                router.push('/profile');
            }, 1500);
        } else {
            setMessage(result.message || '');
        }

        setLoading(false);
    };

    const handleResend = async () => {
        setResendLoading(true);
        setMessage('');

        const result = await resendOTP(email);
        setMessage(result.message || '');

        setResendLoading(false);
    };

    if (!email) {
        return null; // Will redirect
    }

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <form onSubmit={handleSubmit}>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-xl font-bold">Enter verification code</h1>
                        <FieldDescription>
                            We sent a 6-digit code to <strong>{email}</strong>
                        </FieldDescription>
                    </div>

                    {message && (
                        <div
                            className={cn(
                                'rounded-md p-3 text-center text-sm',
                                message.includes('successfully') || message.includes('sent')
                                    ? 'border border-green-200 bg-green-50 text-green-700'
                                    : 'border border-red-200 bg-red-50 text-red-700'
                            )}>
                            {message}
                        </div>
                    )}

                    <Field>
                        <FieldLabel htmlFor="otp" className="sr-only">
                            Verification code
                        </FieldLabel>
                        <InputOTP maxLength={6} id="otp" value={otp} onChange={setOtp} required containerClassName="gap-4">
                            <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                        <FieldDescription className="text-center">
                            Didn&apos;t receive the code?{' '}
                            <button type="button" onClick={handleResend} disabled={resendLoading} className="underline hover:no-underline">
                                {resendLoading ? 'Sending...' : 'Resend'}
                            </button>
                        </FieldDescription>
                    </Field>
                    <Field>
                        <Button type="submit" disabled={loading || otp.length !== 6}>
                            {loading ? 'Verifying...' : 'Verify'}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
            <AuthFooter />
        </div>
    );
}
