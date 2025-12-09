'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

function EditorSkeleton() {
    return (
        <div className="space-y-4 pt-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-3/4" />
            <div className="py-2" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
        </div>
    );
}

export const Editor = dynamic(() => import('./Editor'), {
    ssr: false,
    loading: () => <EditorSkeleton />,
});
