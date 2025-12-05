'use client';

import { useState, useEffect, useRef } from 'react';
import { DefaultReactSuggestionItem, SuggestionMenuProps } from '@blocknote/react';
import { MenuItem, MenuGroupHeader, MenuContainer, MenuEmptyState, groupItems } from './shared';

/**
 * Custom slash menu component.
 */
export function SlashMenu({ items, onItemClick }: SuggestionMenuProps<DefaultReactSuggestionItem>) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Reset selection when items change
    useEffect(() => {
        setSelectedIndex(0);
    }, [items]);

    // Scroll selected item into view
    useEffect(() => {
        const selectedItem = itemRefs.current[selectedIndex];
        if (selectedItem) {
            selectedItem.scrollIntoView({ block: 'nearest', behavior: 'instant' });
        }
    }, [selectedIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (items.length === 0) return;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev <= 0 ? items.length - 1 : prev - 1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev >= items.length - 1 ? 0 : prev + 1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (items[selectedIndex]) {
                        onItemClick?.(items[selectedIndex]);
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [items, selectedIndex, onItemClick]);

    if (items.length === 0) {
        return (
            <MenuContainer>
                <MenuEmptyState />
            </MenuContainer>
        );
    }

    // Add group property for grouping
    const itemsWithGroup = items.map(item => ({ ...item, group: item.group || 'Other' }));
    const groupedItems = groupItems(itemsWithGroup);

    let globalIndex = 0;

    return (
        <MenuContainer className="overflow-y-auto">
            {Object.entries(groupedItems).map(([group, groupItems]) => (
                <div key={group}>
                    <MenuGroupHeader label={group} />
                    {groupItems.map(item => {
                        const currentIndex = globalIndex++;
                        const isSelected = currentIndex === selectedIndex;

                        return (
                            <MenuItem
                                key={item.title}
                                ref={el => {
                                    itemRefs.current[currentIndex] = el;
                                }}
                                icon={item.icon}
                                label={item.title}
                                badge={item.badge}
                                isSelected={isSelected}
                                onClick={() => onItemClick?.(item)}
                                onMouseEnter={() => setSelectedIndex(currentIndex)}
                            />
                        );
                    })}
                </div>
            ))}
        </MenuContainer>
    );
}
