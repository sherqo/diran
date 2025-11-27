'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getAllPagesApi, getBlockApi } from '@/lib/api/block';

// TODO: Define Page type properly in diran/shared and import here and define the inner content
interface Page {
    id: string;
    type: string;
    content: Record<string, unknown>;
    order: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

interface PageContextType {
    pages: Page[];
    currentPage: Page | null;
    loading: boolean;
    pageLoading: boolean;
    loadPage: (id: string) => Promise<void>;
    setCurrentPage: (page: Page | null) => void;
    fetchPages: () => Promise<void>;
}

export type { Page };

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
    const [pages, setPages] = useState<Page[]>([]);
    const [currentPage, setCurrentPage] = useState<Page | null>(null);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const fetchPages = async () => {
        setLoading(true);
        const result = await getAllPagesApi();

        if (result.success && result.data?.pages) {
            setPages(result.data.pages);
        }

        setLoading(false);
    };

    const loadPage = async (id: string) => {
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
    };

    useEffect(() => {
        // Load pages on mount
        fetchPages();
    }, []);

    const value = {
        pages,
        currentPage,
        loading,
        pageLoading,
        loadPage,
        setCurrentPage,
        fetchPages,
    };

    return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export function usePage() {
    const context = useContext(PageContext);
    if (context === undefined) {
        throw new Error('usePage must be used within a PageProvider');
    }
    return context;
}
