'use client';

import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import React, { useCallback, useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

interface MagicCardProps {
    title?: string;
    description?: string;
    children?: React.ReactNode;

    className?: string;

    gradientSize?: number;
    gradientColor?: string;
    gradientOpacity?: number;
    gradientFrom?: string;
    gradientTo?: string;
}

export function MagicCard({
    title,
    description,
    children,
    className,
    gradientSize = 400,
    gradientColor = '#f9f9f9',
    gradientOpacity = 0.8,
    gradientFrom = '#d4ff13ff',
    gradientTo = '#ff6a00',
}: MagicCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(-gradientSize);
    const mouseY = useMotionValue(-gradientSize);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (cardRef.current) {
                const { left, top } = cardRef.current.getBoundingClientRect();
                const clientX = e.clientX;
                const clientY = e.clientY;
                mouseX.set(clientX - left);
                mouseY.set(clientY - top);
            }
        },
        [mouseX, mouseY]
    );

    const handleMouseOut = useCallback(
        (e: MouseEvent) => {
            if (!e.relatedTarget) {
                document.removeEventListener('mousemove', handleMouseMove);
                mouseX.set(-gradientSize);
                mouseY.set(-gradientSize);
            }
        },
        [handleMouseMove, mouseX, gradientSize, mouseY]
    );

    const handleMouseEnter = useCallback(() => {
        document.addEventListener('mousemove', handleMouseMove);
        mouseX.set(-gradientSize);
        mouseY.set(-gradientSize);
    }, [handleMouseMove, mouseX, gradientSize, mouseY]);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseout', handleMouseOut);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseout', handleMouseOut);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [handleMouseEnter, handleMouseMove, handleMouseOut]);

    useEffect(() => {
        mouseX.set(-gradientSize);
        mouseY.set(-gradientSize);
    }, [gradientSize, mouseX, mouseY]);

    return (
        <div
            ref={cardRef}
            className={cn('group relative rounded-lg', className)}>
            <motion.div
                className="pointer-events-none absolute inset-0 rounded-xl bg-black duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
          radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
          ${gradientFrom}, 
          ${gradientTo}, 
          var(--foreground) 100%
          )
          `,
                }}
            />
            <div className="absolute inset-[1px] rounded-xl bg-white" />
            <motion.div
                className="pointer-events-none absolute inset-[2px] rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)
          `,
                    opacity: gradientOpacity,
                }}
            />

            {/* Card Content Container */}
            <div className="relative z-10 h-full flex flex-col p-4 sm:p-8">
                {/* Content */}
                {children && <div className="flex-1">{children}</div>}

                {/* Title and Description at bottom */}
                {(title || description) && (
                    <div className="mt-auto pt-4 ">
                        {title && (
                            <h3 className="text-xl font-semibold text-foreground mb-1 text-primary">
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className="text-md font-semibold text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
