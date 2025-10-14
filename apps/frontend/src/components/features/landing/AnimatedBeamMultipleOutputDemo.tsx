'use client';

import React, { forwardRef, useRef } from 'react';
import Image from 'next/image';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import { cn } from '@/lib/utils';

const Circle = forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                'z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]',
                className
            )}>
            {children}
        </div>
    );
});

Circle.displayName = 'Circle';

export const AnimatedBeamMultipleOutputDemo = ({
    className,
}: {
    className?: string;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const notionRef = useRef<HTMLDivElement>(null);
    const clickupRef = useRef<HTMLDivElement>(null);
    const googleFitRef = useRef<HTMLDivElement>(null);
    const appleFitRef = useRef<HTMLDivElement>(null);
    const googleCalendarRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    return (
        <div
            className={cn(
                'relative flex h-[285px] w-full items-center justify-center overflow-hidden ',
                className
            )}
            ref={containerRef}>
            <div className="flex size-full max-w-sm flex-row items-stretch justify-between gap-10">
                <div className="flex flex-col justify-center">
                    <Circle ref={userRef}>
                        <Icons.user />
                    </Circle>
                </div>
                <div className="flex flex-col justify-center ">
                    <Circle ref={logoRef} className="size-18">
                        <Icons.logo />
                    </Circle>
                </div>
                <div className="flex flex-col justify-center gap-2">
                    <Circle ref={notionRef} className="size-12 p-2 ">
                        <Icons.notion />
                    </Circle>
                    <Circle ref={clickupRef} className="size-12 p-2">
                        <Icons.clickup />
                    </Circle>
                    <Circle ref={googleFitRef} className="size-12 p-2">
                        <Icons.googleFit />
                    </Circle>
                    <Circle ref={appleFitRef} className="size-12 p-2">
                        <Icons.appleFit />
                    </Circle>
                    <Circle ref={googleCalendarRef} className="size-12 p-2">
                        <Icons.googleCalendar />
                    </Circle>
                </div>
            </div>

            {/* AnimatedBeams */}
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={notionRef}
                toRef={logoRef}
                duration={2.2}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={clickupRef}
                toRef={logoRef}
                duration={4}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={googleFitRef}
                toRef={logoRef}
                duration={3.2}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={appleFitRef}
                toRef={logoRef}
                duration={2.6}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={googleCalendarRef}
                toRef={logoRef}
                duration={3.6}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={logoRef}
                toRef={userRef}
                duration={2}
            />
        </div>
    );
};

const Icons = {
    logo: () => (
        <Image
            src="/identity/logo-512.png"
            alt="Website Logo"
            width={48}
            height={48}
            className="rounded-lg"
        />
    ),
    notion: () => (
        <Image
            src="/intergation-icons/Notion.svg"
            alt="Notion"
            width={36}
            height={36}
        />
    ),
    clickup: () => (
        <Image
            src="/intergation-icons/ClickUp.svg"
            alt="ClickUp"
            width={32}
            height={32}
        />
    ),
    googleFit: () => (
        <Image
            src="/intergation-icons/Google_Fit.svg"
            alt="Google Fit"
            width={32}
            height={32}
        />
    ),
    appleFit: () => (
        <Image
            src="/intergation-icons/Apple_Health.svg"
            alt="Apple Health"
            width={32}
            height={32}
        />
    ),
    googleCalendar: () => (
        <Image
            src="/intergation-icons/Google_Calendar.svg"
            alt="Google Calendar"
            width={32}
            height={32}
        />
    ),
    user: () => (
        <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
};
