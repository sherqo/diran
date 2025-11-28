'use client';

import { PageHeader } from '@/components/page-header';
import { usePage } from '@/contexts/PageContext';
import { useEffect } from 'react';

export default function HomePage() {
    const { setCurrentPage } = usePage();

    useEffect(() => {
        setCurrentPage(null);
    }, [setCurrentPage]);

    return (
        <>
            <PageHeader title="Welcome" />
            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-4 p-6">
                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="mb-2 text-2xl font-semibold">Welcome to Diran</h2>
                        <p className="text-muted-foreground">Select a page from the sidebar to get started, or create a new page.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
