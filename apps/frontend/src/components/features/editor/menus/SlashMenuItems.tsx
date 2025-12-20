// https://www.blocknotejs.org/docs/ui-components/suggestion-menus#changing-slash-menu-items

'use client';

import { BlockNoteEditor } from '@blocknote/core';
import { DefaultReactSuggestionItem, getDefaultReactSlashMenuItems } from '@blocknote/react';
import { ReactElement } from 'react';
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

/**
 * These must match BlockNote's EXACT titles from getDefaultReactSlashMenuItems.
 */
const ICONS: Record<string, ReactElement> = {
    Paragraph: <Pilcrow size={18} />,
    'Heading 1': <Heading1 size={18} />,
    'Heading 2': <Heading2 size={18} />,
    'Heading 3': <Heading3 size={18} />,
    Quote: <Quote size={18} />,
    'Bullet List': <List size={18} />,
    'Numbered List': <ListOrdered size={18} />,
    'Check List': <CheckSquare size={18} />,
    'Toggle List': <ChevronRight size={18} />,
    Table: <Table size={18} />,
    'Code Block': <Code size={18} />,
    Divider: <Minus size={18} />,
    Image: <ImageIcon size={18} />,
    Video: <Video size={18} />,
};

/**
 * Map BlockNote's default item titles to our custom groups.
 */
const GROUPS: Record<string, string> = {
    Paragraph: 'Basic',
    'Heading 1': 'Basic',
    'Heading 2': 'Basic',
    'Heading 3': 'Basic',
    Quote: 'Basic',
    'Bullet List': 'Lists',
    'Numbered List': 'Lists',
    'Check List': 'Lists',
    'Toggle List': 'Lists',
    Table: 'Advanced',
    'Code Block': 'Advanced',
    Divider: 'Layout',
    Image: 'Media',
    Video: 'Media',
};

/**
 * Block types we want to show in the slash menu.
 * Must match BlockNote's exact titles.
 */
const SUPPORTED_TYPES = new Set(Object.keys(ICONS));

/**
 * Get slash menu items with custom icons and groups.
 * We keep BlockNote's original items (with their onItemClick handlers) intact,
 * only customizing the visuals (icon, group).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getSlashMenuItems = (editor: BlockNoteEditor<any, any, any>): DefaultReactSuggestionItem[] => {
    const defaultItems = getDefaultReactSlashMenuItems(editor);

    return defaultItems
        .filter(item => SUPPORTED_TYPES.has(item.title))
        .map(item => ({
            ...item,
            icon: ICONS[item.title] ?? item.icon,
            group: GROUPS[item.title] ?? item.group,
        }));
};

/**
 * Filter items based on query string.
 */
export const filterSlashMenuItems = (items: DefaultReactSuggestionItem[], query: string): DefaultReactSuggestionItem[] => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return items;

    return items.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(lowerQuery);
        const aliasMatch = item.aliases?.some(alias => alias.toLowerCase().includes(lowerQuery));
        return titleMatch || aliasMatch;
    });
};
