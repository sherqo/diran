'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import EditorJS, { OutputData } from '@sharqawycs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import { isDevelopment } from '@/lib/utils';

interface EditorProps {
    initialData?: OutputData;
    placeholder?: string;
    readOnly?: boolean;
}

// Default content with basic blocks
const DEFAULT_EDITOR_DATA: OutputData = {
    blocks: [
        {
            type: 'header',
            data: {
                text: 'Welcome to Editor.js',
                level: 1,
            },
        },
        {
            type: 'paragraph',
            data: {
                text: 'This is a simple paragraph. Start editing by clicking here.',
            },
        },
        {
            type: 'list',
            data: {
                fuck: 'yes',
                style: 'unordered',
                items: ['First item', 'Second item', 'Third item'],
            },
        },
    ],
};

export const Editor = forwardRef<EditorRef, EditorProps>((props, ref) => {
    const { initialData = DEFAULT_EDITOR_DATA, placeholder = 'Start typing...', readOnly = false } = props;
    const editorInstance = useRef<EditorJS | null>(null);
    const holderRef = useRef<HTMLDivElement>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        save: async (): Promise<OutputData> => {
            if (!editorInstance.current) throw new Error('Editor not initialized');
            return await editorInstance.current.save();
        },
        destroy: () => {
            if (editorInstance.current) {
                editorInstance.current.destroy();
                editorInstance.current = null;
            }
        },
        clear: async () => {
            if (editorInstance.current) {
                await editorInstance.current.clear();
            }
        },
    }));

    useEffect(() => {
        if (!holderRef.current || editorInstance.current) return;

        editorInstance.current = new EditorJS({
            holder: holderRef.current,
            placeholder,
            readOnly,
            data: initialData,
            tools: {
                header: Header,
                list: List,
            },

            // * Event callbacks - all logged to console - when something changes
            // ? event can be: block-added, block-removed, block-moved, block-changed.
            // ? added, removed, changed: {index}
            // ? moved: {fromIndex, toIndex}
            // ? all of them provide 'target' in detail - the block element affected
            onChange: async (_api, event) => {
                if (Array.isArray(event)) {
                    console.log('omg we have an array');
                    for (const ev of event) {
                        console.log('📝 CHANGED', ev.type);
                        console.log('🔧 Element:', { details: ev.detail.target });
                    }
                } else {
                    const detail = event.detail;
                    const eventType = event.type;
                    const blockIndex = detail.index;
                    const blockId = detail.target.id;
                    const blockType = detail.target.name;
                    const blockContent = (await _api.blocks.getBlockByIndex(blockIndex)?.save()).data;

                    console.log('event-type: ', eventType);
                    console.log('blockIndex: ', blockIndex);
                    console.log('BlockId: ', blockId);
                    console.log('BlockType: ', blockType);
                    console.log('updated blockContent: ', blockContent);
                }
            },

            // TODO: i think this can be used later on loading or smth...
            onReady: () => {
                if (isDevelopment) {
                    console.log('✅ Editor.js is READY!');
                    console.log('🛠️ Available API methods:', {
                        saver: 'api.saver.save() - Get all content',
                        blocks: 'api.blocks - Manipulate blocks',
                        caret: 'api.caret - Control cursor position',
                        sanitizer: 'api.sanitizer - Clean HTML',
                        toolbar: 'api.toolbar - Control toolbar',
                        inlineToolbar: 'api.inlineToolbar - Control inline tools',
                        notifier: 'api.notifier - Show notifications',
                        tooltip: 'api.tooltip - Show tooltips',
                        i18n: 'api.i18n - Translations',
                        readOnly: 'api.readOnly - Toggle read-only mode',
                    });
                    console.log('📚 Block methods:', {
                        'api.blocks.getBlocksCount()': 'Get number of blocks',
                        'api.blocks.getCurrentBlockIndex()': 'Get current block index',
                        'api.blocks.getBlockByIndex(index)': 'Get block by index',
                        'api.blocks.insert(type, data)': 'Insert new block',
                        'api.blocks.delete(index)': 'Delete block',
                        'api.blocks.clear()': 'Delete all blocks',
                        'api.blocks.render(data)': 'Render blocks from data',
                        'api.blocks.move(from, to)': 'Move block',
                        'api.blocks.swap(from, to)': 'Swap blocks',
                    });
                }
            },
        });

        return () => {
            if (editorInstance.current?.destroy) {
                if (isDevelopment) console.log('🗑️ Editor destroyed');
                editorInstance.current.destroy();
                editorInstance.current = null;
            }
        };
        // Only initialize once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={holderRef} className="min-h-[200px]" />;
});

Editor.displayName = 'Editor';

// Type for the ref so you know what methods you can call
export interface EditorRef {
    save: () => Promise<OutputData>;
    destroy: () => void;
    clear: () => Promise<void>;
}
