import type { Page } from '@/contexts/PageContext';

export interface PageItemProps {
    page: Page;
    isActive: boolean;
    isMobile: boolean;
    onCopyLink: (pageId: string) => void;
    onOpenInNewTab: (pageId: string) => void;
}

export interface SortablePageItemProps extends PageItemProps {
    isDeleting: boolean;
    onEditClick: (page: Page) => void;
    onDeleteClick: (pageId: string, pageName: string) => void;
}

export type SharedPageItemProps = PageItemProps;
