import { LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

function Loader({ className, size, ...props }: React.ComponentProps<'svg'> & { size?: number | 'sm' | 'md' | 'lg' | 'xl' }) {
    size = size ?? 8;
    if (size === 'sm') size = 4;
    if (size === 'md') size = 6;
    if (size === 'lg') size = 8;
    if (size === 'xl') size = 12;
    return (
        <LoaderCircle role="status" aria-label="Loading" className={cn(`size-${size} text-primary animate-spin`, className)} {...props} />
    );
}

export { Loader };
