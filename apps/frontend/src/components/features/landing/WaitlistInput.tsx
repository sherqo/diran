'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export function WaitlistInput() {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // Insert directly into Supabase
            const { error } = await supabase.from('waitlist').insert([{ email: value.toLowerCase().trim() }]);

            if (error) {
                // Handle duplicate email error
                if (error.code === '23505') {
                    setMessage('You already here 🎉');
                    setIsSuccess(true);
                } else {
                    setMessage('Failed to join waitlist. Please try again.');
                    setIsSuccess(false);
                }
            } else {
                setMessage('Successfully joined the waitlist! 🎉');
                setIsSuccess(true);
                setValue('');
            }
        } catch {
            setMessage('Network error. Please try again.');
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form
                className="bg-background border-border relative mx-auto w-full overflow-hidden rounded-full border shadow-xl"
                onSubmit={handleSubmit}>
                <div className="flex items-center">
                    <input
                        onChange={e => {
                            setValue(e.target.value);
                        }}
                        value={value}
                        type="email"
                        placeholder="Enter your email"
                        className="text-foreground h-12 flex-1 bg-white px-4 text-sm focus:ring-0 focus:outline-none"
                        required
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-primary-foreground text-md hover:bg-primary/90 m-1 cursor-pointer rounded-full px-4 py-2 font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6">
                        {loading ? 'Joining...' : 'Join Waitlist'}
                    </button>
                </div>
            </form>

            {/* Success/Error Message */}
            {message && <div className={`mt-3 text-center text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>{message}</div>}

            {/* Trust Message */}
            <div className="text-muted-foreground/80 mt-3 flex items-center justify-center gap-2 text-xs">
                <span>
                    By joining, you agree to our{' '}
                    <Link href="/privacy" className="underline">
                        Privacy Policy.
                    </Link>
                </span>
            </div>
        </>
    );
}
