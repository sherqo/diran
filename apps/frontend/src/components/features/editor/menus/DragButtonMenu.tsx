/**
 * https://www.blocknotejs.org/docs/react/components/side-menu
 * https://www.blocknotejs.org/docs/react/components/side-menu#changing-the-drag-handle-menu
 *
 * Built-in items available: BlockColorsItem, RemoveBlockItem, TableHeadersItem
 * Turn Into and Align are NOT built-in for DragHandleMenu, so we implement them manually.
 */

'use client';

import { useCallback } from 'react';
import { Block, DefaultBlockSchema } from '@blocknote/core';
import { SideMenu, DragHandleMenu, RemoveBlockItem, BlockColorsItem, useBlockNoteEditor, useComponentsContext } from '@blocknote/react';
import { SideMenuProps } from '@blocknote/react';
import { AlignLeft, AlignCenter, AlignRight, Pilcrow, Copy, Trash2, Palette } from 'lucide-react';
import { TURN_INTO_BLOCK_TYPES } from './shared';

type BlockType = keyof DefaultBlockSchema;
type TextAlignment = 'left' | 'center' | 'right';

const ALIGNMENTS = [
    { align: 'left' as const, icon: AlignLeft, label: 'Left' },
    { align: 'center' as const, icon: AlignCenter, label: 'Center' },
    { align: 'right' as const, icon: AlignRight, label: 'Right' },
];

/**
 *  turn into, alignment, colors, duplicate, delete.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDragHandleMenu({ block }: { block: Block<any, any, any> }) {
    const editor = useBlockNoteEditor();
    const Components = useComponentsContext();

    const handleBlockTypeChange = useCallback(
        (type: BlockType, props?: Record<string, unknown>) => {
            editor.updateBlock(block, {
                type,
                props: props as Record<string, never>,
            });
        },
        [editor, block]
    );

    const handleAlignChange = useCallback(
        (alignment: TextAlignment) => {
            editor.updateBlock(block, {
                props: { textAlignment: alignment },
            });
        },
        [editor, block]
    );

    const handleDuplicate = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...blockWithoutId } = block;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editor.insertBlocks([blockWithoutId as any], block, 'after');
    }, [editor, block]);

    if (!Components) return null;

    return (
        <DragHandleMenu block={block}>
            {/* Turn Into submenu */}
            <Components.Generic.Menu.Root position="right" sub={true}>
                <Components.Generic.Menu.Trigger sub={true}>
                    <Components.Generic.Menu.Item className="bn-menu-item" subTrigger={true}>
                        <Pilcrow size={16} />
                        Turn into
                    </Components.Generic.Menu.Item>
                </Components.Generic.Menu.Trigger>
                <Components.Generic.Menu.Dropdown sub={true}>
                    {TURN_INTO_BLOCK_TYPES.map(({ type, label, icon: Icon, props }) => (
                        <Components.Generic.Menu.Item
                            key={label}
                            className="bn-menu-item"
                            onClick={() => handleBlockTypeChange(type as BlockType, props)}>
                            <Icon size={16} />
                            {label}
                        </Components.Generic.Menu.Item>
                    ))}
                </Components.Generic.Menu.Dropdown>
            </Components.Generic.Menu.Root>

            {/* Align submenu */}
            <Components.Generic.Menu.Root position="right" sub={true}>
                <Components.Generic.Menu.Trigger sub={true}>
                    <Components.Generic.Menu.Item className="bn-menu-item" subTrigger={true}>
                        <AlignLeft size={16} />
                        Align
                    </Components.Generic.Menu.Item>
                </Components.Generic.Menu.Trigger>
                <Components.Generic.Menu.Dropdown sub={true}>
                    {ALIGNMENTS.map(({ align, icon: Icon, label }) => (
                        <Components.Generic.Menu.Item key={align} className="bn-menu-item" onClick={() => handleAlignChange(align)}>
                            <Icon size={16} />
                            {label}
                        </Components.Generic.Menu.Item>
                    ))}
                </Components.Generic.Menu.Dropdown>
            </Components.Generic.Menu.Root>

            {/* Colors */}
            <BlockColorsItem block={block}>
                <Palette size={16} />
                Colors
            </BlockColorsItem>

            {/* Duplicate */}
            <Components.Generic.Menu.Item className="bn-menu-item" onClick={handleDuplicate}>
                <Copy size={16} />
                Duplicate
            </Components.Generic.Menu.Item>

            {/* Delete */}
            <RemoveBlockItem block={block}>
                <Trash2 size={16} />
                Delete
            </RemoveBlockItem>
        </DragHandleMenu>
    );
}

/**
 * Passes our custom drag handle menu.
 */
export function CustomSideMenu(props: SideMenuProps) {
    return <SideMenu {...props} dragHandleMenu={CustomDragHandleMenu} />;
}
