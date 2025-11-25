'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getAllPagesApi } from '@/lib/api/block';

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
    currentPageId: string | null;
    loading: boolean;
    setCurrentPageId: (id: string | null) => void;
    fetchPages: () => Promise<void>;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
    const [pages, setPages] = useState<Page[]>([]);
    const [currentPageId, setCurrentPageId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchPages = async () => {
        setLoading(true);
        const result = await getAllPagesApi();

        if (result.success && result.data?.pages) {
            setPages(result.data.pages);
        }

        setLoading(false);
    };

    useEffect(() => {
        // Load pages on mount
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPages();
    }, []);

    const value = {
        pages,
        currentPageId,
        loading,
        setCurrentPageId,
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
