'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { getAllPagesApi, getBlockApi } from '@/lib/api/block';
import type { ApiBlock } from '@/shared/types/block';

// TODO: Define Page type properly in diran/shared and import here and define the inner content
export interface Page extends ApiBlock {
    role?: string;
    isTeamPage?: boolean;
}

interface PageContextType {
    pages: Page[];
    currentPage: Page | null;
    loading: boolean;
    pageLoading: boolean;
    loadPage: (id: string) => Promise<void>;
    setCurrentPage: (page: Page | null) => void;
    fetchPages: () => Promise<void>;
    setPages: (value: Page[] | ((prev: Page[]) => Page[])) => void; // added after copilot code review PR #38 for optimistic ui update
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
    const [pages, setPages] = useState<Page[]>([]);
    const [currentPage, setCurrentPage] = useState<Page | null>(null);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const fetchPages = useCallback(async () => {
        setLoading(true);
        const result = await getAllPagesApi();

        if (result.success && result.data?.pages) {
            // Cast API pages to Page[] — backend returns role along with block data
            setPages(result.data.pages as unknown as Page[]);
        }

        setLoading(false);
    }, []);

    // useCallback to avoid recreating the function on every render - PR #38 - copilot code review
    const loadPage = useCallback(async (id: string) => {
        setPageLoading(true);
        try {
            const result = await getBlockApi(id);
            if (result.success && result.data?.block) {
                setCurrentPage(result.data.block as unknown as Page);
            } else {
                setCurrentPage(null);
            }
        } catch (error) {
            console.error('Error loading page:', error);
            setCurrentPage(null);
        } finally {
            setPageLoading(false);
        }
    }, []);

    useEffect(() => {
        // Load pages on mount
        fetchPages();
    }, [fetchPages]);

    const value = useMemo(
        () => ({
            pages,
            currentPage,
            loading,
            pageLoading,
            loadPage,
            setCurrentPage,
            fetchPages,
            setPages,
        }),
        [pages, currentPage, loading, pageLoading, loadPage, fetchPages]
    );

    return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export function usePage() {
    const context = useContext(PageContext);
    if (context === undefined) {
        throw new Error('usePage must be used within a PageProvider');
    }
    return context;
}
