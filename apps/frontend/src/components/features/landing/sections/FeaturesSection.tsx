'use client';

import { AnimatedBeamMultipleOutputDemo } from '@/components/features/landing/AnimatedBeamMultipleOutputDemo';
import ChatDemo from '@/components/features/landing/ChatDemo';
import VoiceInputDemo from '@/components/features/landing/VoiceInputDemo';
import { MagicCard } from '@/components/magicui/magic-card';
import Image from 'next/image';
import { motion } from 'framer-motion';

const FeaturesSection = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            },
        },
    };

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 30,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
        },
    };

    const cardTransition = {
        duration: 0.6,
        ease: 'easeOut' as const,
    };

    return (
        <motion.section
            id="features"
            className="w-full flex flex-col items-center justify-center bg-background py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}>
            <motion.h2
                className="font-clash font-medium text-4xl md:text-6xl text-primary text-center mb-4 md:mb-8 px-6"
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.4 }}>
                Built for brains that get tired.
            </motion.h2>

            <motion.div
                className="w-full max-w-5xl columns-1 md:columns-2 gap-3 p-6 space-y-3"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}>
                <motion.div variants={cardVariants} transition={cardTransition}>
                    <MagicCard
                        title="Not just connected → Aware."
                        description="Diran connects to your tools — not to sync data, but to see patterns, stress points, and burnout triggers before you do."
                        className="h-130 break-inside-avoid rounded-md">
                        <AnimatedBeamMultipleOutputDemo />
                    </MagicCard>
                </motion.div>

                <motion.div variants={cardVariants} transition={cardTransition}>
                    <MagicCard
                        title="Control everything with your voice."
                        description="Get personalized feedback and patterns from your daily activities"
                        className="h-90 break-inside-avoid">
                        <VoiceInputDemo />
                    </MagicCard>
                </motion.div>

                <motion.div variants={cardVariants} transition={cardTransition}>
                    <MagicCard
                        title="When you suck, Diran talks."
                        description="Diran notices the early signs of overload and sends you a check-in and can suggest your next move"
                        className="h-110 break-inside-avoid">
                        <ChatDemo />
                    </MagicCard>
                </motion.div>

                <motion.div variants={cardVariants} transition={cardTransition}>
                    <MagicCard
                        title="When your brain lags, Diran picks."
                        description="Distracted? Diran chooses the one task you should do now — based on your energy, schedule, and past patterns. Everything else disappears till you're done."
                        className="h-110 break-inside-avoid">
                        <div className="flex items-center justify-center h-full">
                            <Image
                                src="/todos.png"
                                alt="An image for busy todo list and Diran AI choose one"
                                width={300}
                                height={300}
                                style={{ width: 'auto' }}
                            />
                        </div>
                    </MagicCard>
                </motion.div>
            </motion.div>
        </motion.section>
    );
};

export default FeaturesSection;
