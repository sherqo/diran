'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBlockApi } from '@/lib/api/block';
import { usePage } from '@/contexts/PageContext';
import { PageHeader } from '@/components/page-header';
import { Loader2 } from 'lucide-react';

export default function PageView() {
    const params = useParams();
    const pageId = params.pageId as string;
    const { setCurrentPageId } = usePage();
    const [pageData, setPageData] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Set current page ID in context
        setCurrentPageId(pageId);

        // Fetch page data
        const fetchPageData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await getBlockApi(pageId);

                if (result.success && result.data?.block) {
                    setPageData(result.data.block as unknown as Record<string, unknown>);
                } else {
                    setError('Failed to load page');
                }
            } catch (err) {
                setError('An error occurred while loading the page');
                console.error('Error fetching page:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();

        // Cleanup: clear current page ID when leaving
        return () => {
            setCurrentPageId(null);
        };
    }, [pageId, setCurrentPageId]);

    const pageTitle =
        pageData?.content && typeof pageData.content === 'object' && 'title' in pageData.content
            ? String(pageData.content.title)
            : 'Untitled';

    if (loading) {
        return (
            <>
                <PageHeader title="Loading..." />
                <div className="flex flex-1 items-center justify-center overflow-y-auto">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </>
        );
    }

    if (error || !pageData) {
        return (
            <>
                <PageHeader title="Error" />
                <div className="flex flex-1 items-center justify-center overflow-y-auto">
                    <div className="text-center">
                        <p className="text-destructive text-lg">{error || 'Page not found'}</p>
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
                        <pre className="bg-muted overflow-auto rounded p-4 text-sm">{JSON.stringify(pageData, null, 2)}</pre>
                    </div>
                </div>
            </div>
        </>
    );
}
