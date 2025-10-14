'use client';

import { motion } from 'framer-motion';
import { WaitlistInput } from '../WaitlistInput';

const CTASection = () => {
    return (
        <section className="flex min-h-screen w-full flex-col items-center justify-center" id="waitlist">
            {/* Texts */}
            <motion.div
                className="max-w-xl px-4 text-center md:max-w-4xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}>
                {/* Main Heading */}
                <motion.h2
                    className="font-clash text-primary mb-4 text-4xl font-medium md:text-6xl"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}>
                    One button. Better decisions.
                </motion.h2>

                {/* Subheading */}
                <motion.p
                    className="text-md text-foreground mx-auto mb-12 max-w-2xl leading-relaxed md:text-xl"
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
                className="w-full max-w-sm px-4 md:max-w-xl md:px-8">
                <WaitlistInput />
            </motion.div>
        </section>
    );
};

export default CTASection;
