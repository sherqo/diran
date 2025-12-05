'use client';

import { useState, useEffect, useRef } from 'react';
import { DefaultReactSuggestionItem, SuggestionMenuProps } from '@blocknote/react';
import { cn } from '@/lib/utils';

/**
 * slash menu component.
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
            selectedItem.scrollIntoView({ block: 'center', behavior: 'smooth' });
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
        return <div className="bg-popover text-popover-foreground w-60 rounded-lg border p-3 text-sm shadow-lg">No results</div>;
    }

    // Group items by category
    const groupedItems = items.reduce(
        (acc, item) => {
            const group = item.group || 'Other';
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(item);
            return acc;
        },
        {} as Record<string, DefaultReactSuggestionItem[]>
    );

    let globalIndex = 0;

    return (
        <div
            className="bg-popover text-popover-foreground max-h-80 w-60 overflow-hidden overflow-y-auto rounded-lg border shadow-lg"
            role="listbox">
            {Object.entries(groupedItems).map(([group, groupItems]) => (
                <div key={group}>
                    <div className="text-muted-foreground bg-muted/30 px-3 py-1.5 text-xs font-medium tracking-wider uppercase">
                        {group}
                    </div>
                    {groupItems.map(item => {
                        const currentIndex = globalIndex++;
                        const isSelected = currentIndex === selectedIndex;

                        return (
                            <button
                                key={item.title}
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
                                onClick={() => onItemClick?.(item)}
                                onMouseEnter={() => setSelectedIndex(currentIndex)}>
                                <span className="text-muted-foreground shrink-0">{item.icon}</span>
                                <span className="flex-1 font-medium">{item.title}</span>
                                {item.badge && <span className="text-muted-foreground font-mono text-xs">{item.badge}</span>}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
