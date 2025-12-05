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
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    Pilcrow,
    Copy,
    Trash2,
    Palette,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    List,
    ListOrdered,
    CheckSquare,
    ChevronRight,
    Code,
} from 'lucide-react';

type BlockType = keyof DefaultBlockSchema;
type TextAlignment = 'left' | 'center' | 'right';

const ALIGNMENTS = [
    { align: 'left', icon: AlignLeft },
    { align: 'center', icon: AlignCenter },
    { align: 'right', icon: AlignRight },
] as const;

const BLOCK_TYPES = [
    { type: 'paragraph', label: 'Text', icon: Pilcrow, props: {} },
    { type: 'heading', label: 'Heading 1', icon: Heading1, props: { level: 1 } },
    { type: 'heading', label: 'Heading 2', icon: Heading2, props: { level: 2 } },
    { type: 'heading', label: 'Heading 3', icon: Heading3, props: { level: 3 } },
    { type: 'quote', label: 'Quote', icon: Quote, props: {} },
    { type: 'bulletListItem', label: 'Bullet List', icon: List, props: {} },
    { type: 'numberedListItem', label: 'Numbered List', icon: ListOrdered, props: {} },
    { type: 'checkListItem', label: 'Check List', icon: CheckSquare, props: {} },
    { type: 'toggleListItem', label: 'Toggle', icon: ChevronRight, props: {} },
    { type: 'codeBlock', label: 'Code', icon: Code, props: {} },
] as const;

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
                    {BLOCK_TYPES.map(({ type, label, icon: Icon, props }) => (
                        <Components.Generic.Menu.Item
                            key={label}
                            className="bn-menu-item"
                            onClick={() => handleBlockTypeChange(type, props)}>
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
                    {ALIGNMENTS.map(({ align, icon: Icon }) => (
                        <Components.Generic.Menu.Item key={align} className="bn-menu-item" onClick={() => handleAlignChange(align)}>
                            <Icon size={16} />
                            {align.charAt(0).toUpperCase() + align.slice(1)}
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
