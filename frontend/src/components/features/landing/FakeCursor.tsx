'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface FakeCursorProps {
    onCursorClick: () => void;
    shouldMove: boolean;
}

const FakeCursor = ({ onCursorClick, shouldMove }: FakeCursorProps) => {
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [hasClicked, setHasClicked] = useState(false);

    useEffect(() => {
        if (shouldMove && !hasClicked) {
            // Calculate center of screen for button position
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            setTimeout(() => {
                setCursorPosition({ x: centerX, y: centerY });

                // Click after cursor reaches button
                setTimeout(() => {
                    setHasClicked(true);
                    onCursorClick();
                }, 1500);
            }, 500);
        }
    }, [shouldMove, onCursorClick, hasClicked]);

    if (!shouldMove) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 100, y: 100 }}
                animate={{
                    opacity: hasClicked ? 0 : 1,
                    x: cursorPosition.x - 10,
                    y: cursorPosition.y - 10,
                    scale: hasClicked ? 0.8 : 1,
                }}
                exit={{ opacity: 0 }}
                transition={{
                    duration: 1.5,
                    ease: 'easeInOut',
                    scale: { duration: 0.2 },
                }}
                className="fixed z-50 pointer-events-none"
                style={{
                    width: '20px',
                    height: '20px',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                }}>
                {/* Cursor SVG */}
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-foreground">
                    <path
                        d="M5 3L19 12L12 14L10 21L5 3Z"
                        fill="currentColor"
                        stroke="white"
                        strokeWidth="1"
                    />
                </svg>

                {/* Click ripple effect */}
                <AnimatePresence>
                    {hasClicked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 3, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="absolute inset-0 border-2 border-primary/50 rounded-full"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
};

export default FakeCursor;
