'use client';

import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import {
    Pilcrow,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    List,
    ListOrdered,
    CheckSquare,
    ChevronRight,
    Table,
    Code,
    ImageIcon,
    Video,
    Minus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ============================================================================
// Block Type Definitions
// ============================================================================

export interface BlockTypeConfig {
    type: string;
    label: string;
    group: string;
    icon: LucideIcon;
    props?: Record<string, unknown>;
}

/**
 * All supported block types with their configuration.
 * Used by SlashMenu, TurnIntoMenu, and DragButtonMenu.
 */
export const BLOCK_TYPES: readonly BlockTypeConfig[] = [
    // Basic
    { type: 'paragraph', label: 'Text', group: 'Basic', icon: Pilcrow },
    { type: 'heading', label: 'Heading 1', group: 'Basic', icon: Heading1, props: { level: 1 } },
    { type: 'heading', label: 'Heading 2', group: 'Basic', icon: Heading2, props: { level: 2 } },
    { type: 'heading', label: 'Heading 3', group: 'Basic', icon: Heading3, props: { level: 3 } },
    { type: 'quote', label: 'Quote', group: 'Basic', icon: Quote },
    // Lists
    { type: 'bulletListItem', label: 'Bullet List', group: 'Lists', icon: List },
    { type: 'numberedListItem', label: 'Numbered List', group: 'Lists', icon: ListOrdered },
    { type: 'checkListItem', label: 'Check List', group: 'Lists', icon: CheckSquare },
    { type: 'toggleListItem', label: 'Toggle List', group: 'Lists', icon: ChevronRight },
    // Advanced
    { type: 'table', label: 'Table', group: 'Advanced', icon: Table },
    { type: 'codeBlock', label: 'Code Block', group: 'Advanced', icon: Code },
    // Layout
    { type: 'divider', label: 'Divider', group: 'Layout', icon: Minus },
    // Media
    { type: 'image', label: 'Image', group: 'Media', icon: ImageIcon },
    { type: 'video', label: 'Video', group: 'Media', icon: Video },
];

/**
 * Block types that can be used in "Turn Into" menu.
 * Excludes media types since you can't turn text into an image.
 */
export const TURN_INTO_BLOCK_TYPES = BLOCK_TYPES.filter(b => !['image', 'video', 'table'].includes(b.type));

// ============================================================================
// Grouping Utilities
// ============================================================================

/**
 * Groups items by their group property.
 */
export function groupItems<T extends { group: string }>(items: T[]): Record<string, T[]> {
    return items.reduce(
        (acc, item) => {
            const group = item.group || 'Other';
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(item);
            return acc;
        },
        {} as Record<string, T[]>
    );
}

// ============================================================================
// Shared Components
// ============================================================================

interface MenuItemProps {
    icon: ReactNode;
    label: string;
    badge?: string;
    isSelected?: boolean;
    onClick?: () => void;
    onMouseEnter?: () => void;
}

/**
 * Reusable menu item component used in SlashMenu and TurnIntoMenu.
 */
export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(({ icon, label, badge, isSelected, onClick, onMouseEnter }, ref) => {
    return (
        <button
            ref={ref}
            role="option"
            aria-selected={isSelected}
            className={cn(
                'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                'hover:bg-accent focus:bg-accent focus:outline-none',
                isSelected && 'bg-accent'
            )}
            onClick={onClick}
            onMouseEnter={onMouseEnter}>
            <span className="text-muted-foreground shrink-0">{icon}</span>
            <span className="flex-1 font-medium">{label}</span>
            {badge && <span className="text-muted-foreground font-mono text-xs">{badge}</span>}
        </button>
    );
});

MenuItem.displayName = 'MenuItem';

interface MenuGroupHeaderProps {
    label: string;
}

/**
 * Group header component for menus.
 */
export function MenuGroupHeader({ label }: MenuGroupHeaderProps) {
    return <div className="text-muted-foreground bg-muted/30 px-3 py-1.5 text-xs font-medium tracking-wider uppercase">{label}</div>;
}

interface MenuContainerProps {
    children: ReactNode;
    className?: string;
}

/**
 * Container component for dropdown menus.
 */
export function MenuContainer({ children, className }: MenuContainerProps) {
    return (
        <div
            className={cn('bg-popover text-popover-foreground max-h-80 w-60 overflow-hidden rounded-lg border shadow-lg', className)}
            role="listbox">
            {children}
        </div>
    );
}

interface MenuEmptyStateProps {
    message?: string;
}

/**
 * Empty state component for when no items match.
 */
export function MenuEmptyState({ message = 'No results' }: MenuEmptyStateProps) {
    return <div className="text-muted-foreground p-3 text-sm">{message}</div>;
}
