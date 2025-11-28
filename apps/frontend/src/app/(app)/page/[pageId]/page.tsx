'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePage } from '@/contexts/PageContext';
import { PageHeader } from '@/components/page-header';
import { Loader2 } from 'lucide-react';

export default function PageView() {
    const params = useParams();
    const pageId = params.pageId as string;
    const { currentPage, pageLoading, loadPage } = usePage();

    useEffect(() => {
        loadPage(pageId);
    }, [pageId, loadPage]);

    const pageTitle =
        currentPage?.content && typeof currentPage.content === 'object' && 'title' in currentPage.content
            ? String(currentPage.content.title)
            : 'Untitled';

    if (pageLoading) {
        return (
            <>
                <PageHeader title="Loading..." />
                <div className="flex flex-1 items-center justify-center overflow-y-auto">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </>
        );
    }

    if (!currentPage) {
        return (
            <>
                <PageHeader title="Error" />
                <div className="flex flex-1 items-center justify-center overflow-y-auto">
                    <div className="text-center">
                        <p className="text-destructive text-lg">Page not found</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <PageHeader title={pageTitle} />
            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-4 p-6">
                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="mb-4 text-xl font-semibold">Page Data (Raw)</h2>
                        <pre className="bg-muted overflow-auto rounded p-4 text-sm">{JSON.stringify(currentPage, null, 2)}</pre>
                    </div>
                </div>
            </div>
        </>
    );
}
