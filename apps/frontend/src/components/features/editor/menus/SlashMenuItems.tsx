'use client';

import { BlockNoteEditor } from '@blocknote/core';
import { DefaultReactSuggestionItem, getDefaultReactSlashMenuItems } from '@blocknote/react';
import { BLOCK_TYPES } from './shared';

// Build maps from shared BLOCK_TYPES config
const LABEL_TO_ICON = Object.fromEntries(
    BLOCK_TYPES.map(b => {
        const Icon = b.icon;
        // eslint-disable-next-line react/jsx-key
        return [b.label, <Icon size={18} />];
    })
);

const LABEL_TO_GROUP = Object.fromEntries(BLOCK_TYPES.map(b => [b.label, b.group]));

const SUPPORTED_LABELS = new Set(BLOCK_TYPES.map(b => b.label));

// Map BlockNote's default titles to our labels
const TITLE_TO_LABEL: Record<string, string> = {
    Paragraph: 'Text',
    'Heading 1': 'Heading 1',
    'Heading 2': 'Heading 2',
    'Heading 3': 'Heading 3',
    Quote: 'Quote',
    'Bullet List': 'Bullet List',
    'Numbered List': 'Numbered List',
    'Check List': 'Check List',
    'Toggle List': 'Toggle List',
    Table: 'Table',
    'Code Block': 'Code Block',
    Image: 'Image',
    Video: 'Video',
};

/**
 * Filters to supported types and adds custom icons.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getSlashMenuItems = (editor: BlockNoteEditor<any, any, any>): DefaultReactSuggestionItem[] => {
    const defaultItems = getDefaultReactSlashMenuItems(editor);

    return defaultItems
        .filter(item => {
            const label = TITLE_TO_LABEL[item.title];
            return label && SUPPORTED_LABELS.has(label);
        })
        .map(item => {
            const label = TITLE_TO_LABEL[item.title] || item.title;
            return {
                ...item,
                icon: LABEL_TO_ICON[label] || item.icon,
                group: LABEL_TO_GROUP[label] || item.group,
            };
        });
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
