'use client';
import { useEffect } from 'react';
import { motion, stagger, useAnimate } from 'motion/react';
import { cn } from '@/lib/utils';

export const TextGenerateEffect = ({
    words,
    className,
    filter = true,
    duration = 0.5,
    onComplete,
}: {
    words: string;
    className?: string;
    filter?: boolean;
    duration?: number;
    onComplete?: () => void;
}) => {
    const [scope, animate] = useAnimate();
    const wordsArray = words.split(' ');
    useEffect(() => {
        animate(
            'span',
            {
                opacity: 1,
                filter: filter ? 'blur(0px)' : 'none',
            },
            {
                duration: duration ? duration : 1,
                delay: stagger(0.2),
            }
        );

        // Call onComplete when animation finishes
        if (onComplete) {
            const totalDuration = (duration || 1) + wordsArray.length * 0.2;
            setTimeout(() => {
                onComplete();
            }, totalDuration * 1000);
        }
    }, [animate, duration, filter, onComplete, wordsArray.length]);

    const renderWords = () => {
        return (
            <motion.div ref={scope}>
                {wordsArray.map((word, idx) => {
                    return (
                        <motion.span
                            key={word + idx}
                            className="text-black opacity-0 dark:text-white"
                            style={{
                                filter: filter ? 'blur(10px)' : 'none',
                            }}>
                            {word}{' '}
                        </motion.span>
                    );
                })}
            </motion.div>
        );
    };

    return <div className={cn(className)}>{renderWords()}</div>;
};
