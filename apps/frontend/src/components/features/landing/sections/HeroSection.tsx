'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WaitlistInput } from '@/components/features/landing/WaitlistInput';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';

const HeroSection = () => {
    const [showParagraph, setShowParagraph] = useState(false);
    const [showWaitlist, setShowWaitlist] = useState(false);

    const handleTextComplete = () => {
        // Show paragraph first
        setTimeout(() => {
            setShowParagraph(true);

            // Then show waitlist after paragraph starts (before it ends)
            setTimeout(() => {
                setShowWaitlist(true);
            }, 200);
        }, 300);
    };

    return (
        <section id="hero" className="relative flex min-h-screen w-full flex-col items-center justify-center">
            {/* TEXTS */}
            <div className="max-w-lg px-4 text-center md:max-w-3xl">
                <TextGenerateEffect
                    words="The missing button in your life"
                    className="font-clash text-foreground mb-6 text-5xl leading-tight font-medium tracking-tight md:text-7xl"
                    onComplete={handleTextComplete}
                />

                {/* PARAGRAPH */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: showParagraph ? 1 : 0,
                        y: showParagraph ? 0 : 20,
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-md text-muted-foreground mx-auto max-w-xl px-10 md:text-xl">
                    It knows when you&#39;re not okay - faster than your burnout.
                </motion.p>
            </div>

            {/* WAITLIST INPUT */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{
                    opacity: showWaitlist ? 1 : 0,
                    y: showWaitlist ? 0 : 30,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="mt-20 w-full max-w-sm px-4 md:max-w-xl md:px-8">
                <WaitlistInput />
            </motion.div>
        </section>
    );
};

export default HeroSection;
