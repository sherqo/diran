'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedButton from '@/components/features/landing/AnimatedButton';
import FakeCursor from '@/components/features/landing/FakeCursor';

interface IntroAnimationProps {
    children: React.ReactNode;
}

const IntroAnimation = ({ children }: IntroAnimationProps) => {
    const [animationStage, setAnimationStage] = useState<
        'initial' | 'cursor' | 'clicked' | 'complete'
    >('initial');
    const [buttonClicked, setButtonClicked] = useState(false);

    useEffect(() => {
        setAnimationStage('cursor');
    }, []);

    const handleCursorClick = () => {
        setButtonClicked(true);
        setAnimationStage('clicked');

        // Complete animation - just hide intro and show content
        setTimeout(() => {
            setAnimationStage('complete');
        }, 1300);
    };

    if (animationStage === 'complete') {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen w-full relative overflow-hidden">
            {/* Clean beige background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-background to-accent/10"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            />

            {/* Centered button */}
            <div className="absolute inset-0 flex items-center justify-center">
                {animationStage !== 'initial' && (
                    <AnimatedButton isClicked={buttonClicked} />
                )}
            </div>

            {/* Fake cursor */}
            <FakeCursor
                onCursorClick={handleCursorClick}
                shouldMove={animationStage === 'cursor'}
            />
        </div>
    );
};

export default IntroAnimation;
