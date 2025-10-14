import React, { useState, useEffect } from 'react';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';

const VoiceInputDemo = () => {
    const texts = [
        'Log this: I had a rough day, felt distracted, and skipped lunch.',
        'Add meeting with Kareem tomorrow at 3 PM.',
        'I feel like shit.',
        'Summarize my week.',
        'Cancel everything for today.',
        'What did I do last Sunday?',
        'Diran, focus mode.',
        'Journal this: I finally fixed that bug.',
        'Pause next 2 hours.',
        'Tell me why I burned out last month.',
    ];

    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            // Hide current text
            setIsVisible(false);

            setTimeout(() => {
                // Change to next text and show it
                setCurrentTextIndex(prev => (prev + 1) % texts.length);
                setIsVisible(true);
            }, 500);
        }, 4000); // Change text every 4 seconds

        return () => clearInterval(interval);
    }, [texts.length]);

    return (
        <div className="relative flex h-full w-full items-center justify-center p-6">
            {/* Main container */}
            <div className="w-full max-w-md">
                {/* Voice input field */}
                <div className="relative rounded-2xl bg-white shadow-lg ring-2 shadow-orange-200/50 ring-orange-200/60">
                    {/* Input field */}
                    <div className="flex h-12 items-center space-x-4 p-4">
                        {/* Simple CSS-only soundwave visualization */}
                        <div className="flex h-8 w-16 flex-shrink-0 items-center justify-center space-x-1">
                            <div
                                className="h-3 w-1 animate-pulse rounded-full bg-orange-400"
                                style={{
                                    animationDelay: '0s',
                                    animationDuration: '0.8s',
                                }}
                            />
                            <div
                                className="h-5 w-1 animate-pulse rounded-full bg-orange-500"
                                style={{
                                    animationDelay: '0.1s',
                                    animationDuration: '0.6s',
                                }}
                            />
                            <div
                                className="h-4 w-1 animate-pulse rounded-full bg-orange-400"
                                style={{
                                    animationDelay: '0.2s',
                                    animationDuration: '0.9s',
                                }}
                            />
                            <div
                                className="h-6 w-1 animate-pulse rounded-full bg-orange-500"
                                style={{
                                    animationDelay: '0.3s',
                                    animationDuration: '0.7s',
                                }}
                            />
                            <div
                                className="h-3 w-1 animate-pulse rounded-full bg-orange-400"
                                style={{
                                    animationDelay: '0.4s',
                                    animationDuration: '0.8s',
                                }}
                            />
                            <div
                                className="h-5 w-1 animate-pulse rounded-full bg-orange-500"
                                style={{
                                    animationDelay: '0.5s',
                                    animationDuration: '0.6s',
                                }}
                            />
                        </div>

                        {/* Text generation effect with looping texts */}
                        <div className="flex h-full flex-1 items-center overflow-hidden">
                            <div className="w-full">
                                {isVisible && (
                                    <TextGenerateEffect
                                        key={currentTextIndex} // Force re-render on text change
                                        words={texts[currentTextIndex]}
                                        className="text-sm leading-relaxed whitespace-nowrap text-gray-800"
                                        duration={0.6} // Faster typing effect
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status indicator */}
                <div className="mt-3 flex items-center justify-center space-x-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />
                    <span className="font-clash text-xs text-gray-500">Diran AI...</span>
                </div>
            </div>
        </div>
    );
};

export default VoiceInputDemo;
