'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useBlockNoteEditor } from '@blocknote/react';
import { Block } from '@blocknote/core';
import { cn } from '@/lib/utils';
import { Pilcrow, Heading1, Heading2, Heading3, Quote, List, ListOrdered, CheckSquare, ChevronRight, Code } from 'lucide-react';

interface BlockTypeItem {
    type: string;
    label: string;
    group: string;
    icon: React.ReactNode;
    props?: Record<string, unknown>;
}

const BLOCK_TYPES: BlockTypeItem[] = [
    { type: 'paragraph', label: 'Text', group: 'Basic', icon: <Pilcrow size={18} /> },
    { type: 'heading', label: 'Heading 1', group: 'Basic', icon: <Heading1 size={18} />, props: { level: 1 } },
    { type: 'heading', label: 'Heading 2', group: 'Basic', icon: <Heading2 size={18} />, props: { level: 2 } },
    { type: 'heading', label: 'Heading 3', group: 'Basic', icon: <Heading3 size={18} />, props: { level: 3 } },
    { type: 'quote', label: 'Quote', group: 'Basic', icon: <Quote size={18} /> },
    { type: 'bulletListItem', label: 'Bullet List', group: 'Lists', icon: <List size={18} /> },
    { type: 'numberedListItem', label: 'Numbered List', group: 'Lists', icon: <ListOrdered size={18} /> },
    { type: 'checkListItem', label: 'Check List', group: 'Lists', icon: <CheckSquare size={18} /> },
    { type: 'toggleListItem', label: 'Toggle', group: 'Lists', icon: <ChevronRight size={18} /> },
    { type: 'codeBlock', label: 'Code', group: 'Advanced', icon: <Code size={18} /> },
];

interface TurnIntoMenuProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    block: Block<any, any, any>;
    onClose?: () => void;
}

/**
 * Turn Into Menu - styled like the slash menu.
 * Used from the side menu drag handle.
 */
export function TurnIntoMenu({ block, onClose }: TurnIntoMenuProps) {
    const editor = useBlockNoteEditor();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter items based on search
    const filteredItems = BLOCK_TYPES.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));

    // Reset selection when items change
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Scroll selected item into view
    useEffect(() => {
        const selectedItem = itemRefs.current[selectedIndex];
        if (selectedItem) {
            selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [selectedIndex]);

    const handleBlockTypeChange = useCallback(
        (item: BlockTypeItem) => {
            editor.updateBlock(block, {
                type: item.type as 'paragraph',
                props: item.props as Record<string, never>,
            });
            onClose?.();
        },
        [editor, block, onClose]
    );

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (filteredItems.length === 0) return;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev <= 0 ? filteredItems.length - 1 : prev - 1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev >= filteredItems.length - 1 ? 0 : prev + 1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (filteredItems[selectedIndex]) {
                        handleBlockTypeChange(filteredItems[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose?.();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [filteredItems, selectedIndex, handleBlockTypeChange, onClose]);

    // Group items by category
    const groupedItems = filteredItems.reduce(
        (acc, item) => {
            if (!acc[item.group]) {
                acc[item.group] = [];
            }
            acc[item.group].push(item);
            return acc;
        },
        {} as Record<string, BlockTypeItem[]>
    );

    let globalIndex = 0;

    return (
        <div className="bg-popover text-popover-foreground max-h-80 w-60 overflow-hidden rounded-lg border shadow-lg">
            {/* Search input */}
            <div className="border-b p-2">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search blocks..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
                />
            </div>

            {/* Items */}
            <div className="max-h-64 overflow-y-auto" role="listbox">
                {filteredItems.length === 0 ? (
                    <div className="text-muted-foreground p-3 text-sm">No results</div>
                ) : (
                    Object.entries(groupedItems).map(([group, items]) => (
                        <div key={group}>
                            <div className="text-muted-foreground bg-muted/30 px-3 py-1.5 text-xs font-medium tracking-wider uppercase">
                                {group}
                            </div>
                            {items.map(item => {
                                const currentIndex = globalIndex++;
                                const isSelected = currentIndex === selectedIndex;

                                return (
                                    <button
                                        key={item.label}
                                        ref={el => {
                                            itemRefs.current[currentIndex] = el;
                                        }}
                                        role="option"
                                        aria-selected={isSelected}
                                        className={cn(
                                            'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                                            'hover:bg-accent focus:bg-accent focus:outline-none',
                                            isSelected && 'bg-accent'
                                        )}
                                        onClick={() => handleBlockTypeChange(item)}
                                        onMouseEnter={() => setSelectedIndex(currentIndex)}>
                                        <span className="text-muted-foreground shrink-0">{item.icon}</span>
                                        <span className="flex-1 font-medium">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
