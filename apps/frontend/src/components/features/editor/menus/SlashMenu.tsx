'use client';

import { useRef, useMemo, useEffect } from 'react';
import { DefaultReactSuggestionItem, SuggestionMenuProps } from '@blocknote/react';
import { MenuItem, MenuGroupHeader, MenuContainer, MenuEmptyState, groupItems } from './shared';

/**
 * slash menu component.
 * BlockNote handles keyboard navigation and selection internally via SuggestionMenuController.
 * We just render the items and call onItemClick when clicked.
 */
export function SlashMenu({ items, selectedIndex, onItemClick }: SuggestionMenuProps<DefaultReactSuggestionItem>) {
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Group items for display
    const groupedItems = useMemo(() => {
        const itemsWithGroup = items.map(item => ({ ...item, group: item.group || 'Other' }));
        return groupItems(itemsWithGroup);
    }, [items]);

    // Scroll selected item into view
    useEffect(() => {
        if (selectedIndex !== undefined && itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
        }
    }, [selectedIndex]);

    if (items.length === 0) {
        return (
            <MenuContainer>
                <MenuEmptyState />
            </MenuContainer>
        );
    }

    return (
        <MenuContainer className="overflow-y-auto">
            {Object.entries(groupedItems).map(([group, groupItemsList]) => (
                <div key={group}>
                    <MenuGroupHeader label={group} />
                    {groupItemsList.map(item => {
                        // BlockNote provides selectedIndex based on original items array order
                        // We need to find the item's original index to match
                        const originalIndex = items.findIndex(i => i.title === item.title);
                        const isSelected = originalIndex === selectedIndex;

                        return (
                            <MenuItem
                                key={item.title}
                                ref={el => {
                                    itemRefs.current[originalIndex] = el;
                                }}
                                icon={item.icon}
                                label={item.title}
                                badge={item.badge}
                                isSelected={isSelected}
                                onClick={() => onItemClick?.(item)}
                            />
                        );
                    })}
                </div>
            ))}
        </MenuContainer>
    );
}
