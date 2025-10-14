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
            const { error } = await supabase
                .from('waitlist')
                .insert([{ email: value.toLowerCase().trim() }]);

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
                className="w-full relative mx-auto bg-background rounded-full overflow-hidden shadow-xl border border-border"
                onSubmit={handleSubmit}>
                <div className="flex items-center">
                    <input
                        onChange={(e) => {
                            setValue(e.target.value);
                        }}
                        value={value}
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 text-sm bg-white text-foreground h-12 focus:outline-none focus:ring-0 px-4"
                        required
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 rounded-full font-medium text-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 m-1 cursor-pointer">
                        {loading ? 'Joining...' : 'Join Waitlist'}
                    </button>
                </div>
            </form>

            {/* Success/Error Message */}
            {message && (
                <div
                    className={`text-center text-sm mt-3 ${
                        isSuccess ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {message}
                </div>
            )}

            {/* Trust Message */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/80 mt-3">
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
