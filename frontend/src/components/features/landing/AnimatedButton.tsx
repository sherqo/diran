'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedButtonProps {
    onButtonClick?: () => void;
    isClicked: boolean;
}

const AnimatedButton = ({ onButtonClick, isClicked }: AnimatedButtonProps) => {
    return (
        <div className="relative flex items-center justify-center">
            {/* Button with glow effect */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: 1,
                    scale: isClicked ? 0.9 : 1,
                    boxShadow: isClicked
                        ? '0 0 30px rgba(255, 106, 0, 0.3), 0 0 60px rgba(255, 106, 0, 0.1)'
                        : '0 0 40px rgba(255, 106, 0, 0.4), 0 0 80px rgba(255, 106, 0, 0.2)',
                }}
                transition={{
                    duration: 1.2,
                    ease: 'easeOut',
                    boxShadow: { duration: 0.3 },
                    scale: { duration: 0.2 },
                }}
                onClick={onButtonClick}
                className="relative px-8 py-4 bg-gradient-to-r from-primary to-ring text-primary-foreground 
                          rounded-full font-semibold text-xl border-2 border-primary/20
                          backdrop-blur-sm overflow-hidden"
                style={{
                    background:
                        'linear-gradient(135deg, #FF6A00 0%, #FF8C42 100%)',
                }}>
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />

                {/* Button text */}
                <span className="relative z-10">Diran me</span>

                {/* Ripple effect */}
                <AnimatePresence>
                    {isClicked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 4, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="absolute inset-0 bg-white/30 rounded-full"
                        />
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Shockwave effect */}
            <AnimatePresence>
                {isClicked && (
                    <motion.div
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 8, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="absolute inset-0 border-2 border-primary/30 rounded-full"
                        style={{ pointerEvents: 'none' }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnimatedButton;
