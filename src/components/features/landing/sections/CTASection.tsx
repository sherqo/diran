'use client';

import { motion } from 'framer-motion';
import { WaitlistInput } from '../WaitlistInput';

const CTASection = () => {
    return (
        <section
            className="w-full min-h-screen flex flex-col items-center justify-center"
            id="waitlist">
            {/* Texts */}
            <motion.div
                className="text-center px-4 max-w-xl md:max-w-4xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}>
                {/* Main Heading */}
                <motion.h2
                    className="text-4xl md:text-6xl font-clash font-medium text-primary mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}>
                    One button. Better decisions.
                </motion.h2>

                {/* Subheading */}
                <motion.p
                    className="text-md md:text-xl text-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}>
                    Let Diran AI clear the noise and pick your next move.
                </motion.p>
            </motion.div>

            {/* CTA Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="w-full max-w-sm md:max-w-xl px-4 md:px-8">
                <WaitlistInput />
            </motion.div>
        </section>
    );
};

export default CTASection;
