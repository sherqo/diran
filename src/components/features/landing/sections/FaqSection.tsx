'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';

interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

interface FaqSection {
    heading?: string;
    items?: FaqItem[];
}

const faqData = [
    {
        question: 'What exactly does Diran do?',
        answer: 'Diran watches your life — calendar, sleep, habits — and warns you when you’re about to burn out. It spots stress patterns, predicts crash moments, distraction loops, energy drops, and gives you simple, smart fixes: reschedule stuff, pick one task, block distractions, or just breathe.',
    },
    {
        question: 'What’s the idea behind the “one button”?',
        answer: 'When you’re overwhelmed or burnt out, the last thing you want is to plan, explain, or think. The “one button” is a fast way to get help without effort. Tap it, and Diran instantly analyzes your situation and gives you clear, personalized suggestions — whether that’s rescheduling tasks, taking a break, or shifting focus. One button. One action. No friction.',
    },
    {
        question: 'Who is Diran for?',
        answer: 'People who work hard and break down silently. Founders. Students. Creators. People who don’t like to journal, don’t reflect, and don’t want to talk — just want to fix it fast.',
    },

    {
        question: 'Is Diran a planner or a journal app?',
        answer: 'No. It’s not a planner, journal, or to-do app. It’s a smart system that monitors your life patterns, detects burnout early, and gives you honest feedback before things get worse.',
    },
    {
        question: 'How does Diran know I’m about to crash?',
        answer: 'Diran analyzes your patterns — chaotic schedules, poor sleep, back-to-back meetings, and energy drops. If your current week resembles a previous burnout pattern, it sends you a warning — proactively, without needing any input from you.',
    },

    {
        question: 'What can I do with Diran?',
        answer: 'It connects to your tools — Google Calendar, Apple Health, Google Fit, Notion, ClickUp — and monitors your daily patterns. It detects early signs of burnout: sleep drops, calendar overload, meeting chaos, mental fatigue. Tap the button and get personalized actions: reschedule tasks, reorder your day, take a break, refocus. Speak instead of typing — Diran can transcribe, summarize, journal, and even open the right chat or delete a task for you.',
    },
    {
        question: 'What makes Diran different from all the “productivity” tools?',
        answer: 'Most tools push you to do more. Diran helps you do what matters — at the right time. It watches your real-life patterns (schedule, sleep, energy) and shows you what’s draining your performance. Less chaos. More clarity.',
    },
    {
        question: 'Can’t I just use ChatGPT for this?',
        answer: 'Diran isn’t another GPT wrapper. It connects to your actual life — calendar, health, habits — and gives context-aware guidance. No need to prompt or explain your situation every time. It already knows.',
    },

    // {
    //     question: 'What’s the MVP right now?',
    //     answer: 'Landing page + waitlist. Then: connect calendar + health data → predict burnout days → suggest reschedules + recovery blocks. Focused, real, simple. Not trying to do everything.',
    // },

    // {
    //     question: 'Why should I trust Diran?',
    //     answer: 'Because you don’t have time to explain your pain. Diran learns your patterns and warns you before you crash. It’s not perfect, but it’s always watching and always improving.',
    // },

    // {
    //     question: 'Do I need to journal or write stuff?',
    //     answer: 'Nah. Hate journaling? Just speak. Diran listens, summarizes your day, and adds it to your burnout timeline. Or just tap a few multiple choice buttons. That’s it.',
    // },
];

const FaqSection = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.section
            className="flex min-h-screen w-full flex-col items-center justify-center"
            id="faq"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}>
            <div className="container max-w-3xl px-8">
                <motion.h2
                    className="font-clash mb-8 text-center text-4xl font-medium md:mb-12 md:text-5xl"
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}>
                    Frequently Asked Questions
                </motion.h2>

                <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <Accordion type="single" collapsible>
                        {faqData.map((item, index) => (
                            <motion.div key={'faq-' + index} variants={itemVariants} transition={{ duration: 0.5, ease: 'easeOut' }}>
                                <AccordionItem value={`item-${index}`}>
                                    <AccordionTrigger className="hover:text-primary cursor-pointer font-semibold transition-colors duration-200 hover:no-underline">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                                </AccordionItem>
                            </motion.div>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default FaqSection;
