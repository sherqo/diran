import React from 'react';
import { cn } from '@/lib/utils';

type GradientAngle =
    | 'to bottom right'
    | 'to bottom left'
    | 'to top right'
    | 'to top left'
    | 'to right'
    | 'to left'
    | 'to top'
    | 'to bottom';

interface CardProps {
    children?: React.ReactNode;
    className?: string;
    colors?: string[]; // Hex, rgba, hsl, etc.
    angle?: GradientAngle;
    title?: string;
    description?: string;
}

export const Card = ({
    children,
    className,
    colors = [
        '#fdba74cc', // orange-300/80%
        '#fde68acc', // amber-200/80%
        '#fef9c3aa', // yellow-100/67%
        '#ffedd5bb', // orange-100/73%
        '#fecaca66', // red-200/40%
        '#fff7ed99', // orange-50/60%
    ],
    angle = 'to bottom right',
    title,
    description,
}: CardProps) => {
    const gradient = `linear-gradient(${angle}, ${colors.join(', ')})`;

    return (
        <div className={cn('relative flex flex-col overflow-hidden rounded-2xl p-8', className)}>
            {/* Gradient Layer */}
            <div className="absolute inset-0 rounded-2xl" style={{ background: gradient }} />
            {/* Glass layer */}
            <div className="absolute inset-0 rounded-2xl border border-white/40 bg-white/25 backdrop-blur-md" />

            {/* Content */}
            {children && <div className="relative z-10 flex-1">{children}</div>}

            {/* Title and Description at bottom */}
            {(title || description) && (
                <div className="relative z-10 mt-auto pt-4">
                    {title && <h3 className="text-foreground mb-1 text-xl font-semibold">{title}</h3>}
                    {description && <p className="text-md text-muted-foreground font-semibold">{description}</p>}
                </div>
            )}
        </div>
    );
};
