'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import EditorJS, { OutputData } from '@sharqawycs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';

interface SimpleEditorProps {
    initialData?: OutputData;
    placeholder?: string;
    readOnly?: boolean;
}

// Default content with basic blocks
const DEFAULT_EDITOR_DATA: OutputData = {
    blocks: [
        {
            id: 'idid1',
            type: 'header',
            data: {
                text: 'Welcome to Editor.js',
                level: 1,
            },
        },
        {
            id: 'idid2',
            type: 'paragraph',
            data: {
                text: 'This is a simple paragraph. Start editing by clicking here.',
            },
        },
        {
            id: 'idid3',
            type: 'list',
            data: {
                fuck: 'yes',
                style: 'unordered',
                items: ['First item', 'Second item', 'Third item'],
            },
        },
    ],
};

/**
 * SUPER SIMPLE Editor.js wrapper
 *
 * Usage:
 * ```tsx
 * const editorRef = useRef<SimpleEditorRef>(null);
 *
 * <SimpleEditor ref={editorRef} />
 *
 * // Get data when you want it:
 * const data = await editorRef.current?.save();
 * console.log(data); // This is your Editor.js output
 * ```
 */
export const SimpleEditor = forwardRef<SimpleEditorRef, SimpleEditorProps>((props, ref) => {
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

            // Event callbacks - all logged to console
            onChange: async (api, event) => {
                // console.log('📝 CHANGED', event.type);
                // console.log('🔧 Element:', { details: event.detail.target });

                try {
                    const content = await api.saver.save();

                    // Readable summary
                    console.log(`📦 Total Blocks: ${content.blocks.length}`);

                    // Full JSON - copy this for backend
                    console.log('📄 FULL JSON:', content);
                    console.log('---');
                } catch (err) {
                    console.error('Error getting content:', err);
                }
            },

            onReady: () => {
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
            },
        });

        return () => {
            if (editorInstance.current?.destroy) {
                console.log('🗑️ Editor destroyed');
                editorInstance.current.destroy();
                editorInstance.current = null;
            }
        };
        // Only initialize once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={holderRef} className="min-h-[200px]" />;
});

SimpleEditor.displayName = 'SimpleEditor';

// Type for the ref so you know what methods you can call
export interface SimpleEditorRef {
    save: () => Promise<OutputData>;
    destroy: () => void;
    clear: () => Promise<void>;
}
