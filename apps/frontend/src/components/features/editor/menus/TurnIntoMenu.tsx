'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useBlockNoteEditor } from '@blocknote/react';
import { Block } from '@blocknote/core';
import { TURN_INTO_BLOCK_TYPES, BlockTypeConfig, MenuItem, MenuGroupHeader, MenuContainer, MenuEmptyState, groupItems } from './shared';

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
    const filteredItems = TURN_INTO_BLOCK_TYPES.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));

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
            selectedItem.scrollIntoView({ block: 'nearest', behavior: 'instant' });
        }
    }, [selectedIndex]);

    const handleBlockTypeChange = useCallback(
        (item: BlockTypeConfig) => {
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

    const groupedItems = groupItems(filteredItems as BlockTypeConfig[]);

    let globalIndex = 0;

    return (
        <MenuContainer>
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
                    <MenuEmptyState />
                ) : (
                    Object.entries(groupedItems).map(([group, items]) => (
                        <div key={group}>
                            <MenuGroupHeader label={group} />
                            {items.map(item => {
                                const currentIndex = globalIndex++;
                                const isSelected = currentIndex === selectedIndex;
                                const Icon = item.icon;

                                return (
                                    <MenuItem
                                        key={item.label}
                                        ref={el => {
                                            itemRefs.current[currentIndex] = el;
                                        }}
                                        icon={<Icon size={18} />}
                                        label={item.label}
                                        isSelected={isSelected}
                                        onClick={() => handleBlockTypeChange(item)}
                                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                                    />
                                );
                            })}
                        </div>
                    ))
                )}
            </div>
        </MenuContainer>
    );
}
