// page.tsx - Lexical Editor with proper setup
'use client';

import { useRef, useState } from 'react';
import { $getRoot, $createParagraphNode, $createTextNode, EditorState } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';

import { BlockNode } from './BlockNode';

const theme = {
    paragraph: 'mb-2 text-base leading-relaxed',
    heading: {
        h1: 'text-4xl font-bold mb-4',
        h2: 'text-3xl font-bold mb-3',
        h3: 'text-2xl font-semibold mb-2',
    },
    text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
    },
    quote: 'border-l-4 border-gray-300 pl-4 italic',
    code: 'bg-gray-100 font-mono text-sm p-4 rounded',
    list: {
        ul: 'list-disc ml-4',
        ol: 'list-decimal ml-4',
    },
};

function onError(error: Error) {
    console.error('Lexical Error:', error);
}

// ──────────────────────────────
// This is the part that calls YOUR API
// ──────────────────────────────
function MyOnChangePlugin({ onJsonChange }: { onJsonChange: (json: ReturnType<EditorState['toJSON']>) => void }) {
    const previousJson = useRef<string>('');

    const handleChange = (editorState: EditorState) => {
        // Convert editor state to JSON - this is the proper Lexical API
        const json = editorState.toJSON();
        const jsonString = JSON.stringify(json, null, 2);

        // Only call API when something actually changed
        if (jsonString !== previousJson.current) {
            previousJson.current = jsonString;
            onJsonChange(json);

            // YOUR API CALL — uncomment when you have a backend
            // fetch(`/api/pages/${pageId}/sync`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: jsonString,
            // }).catch(console.error);
        }
    };

    return <OnChangePlugin onChange={handleChange} ignoreSelectionChange />;
}

// ──────────────────────────────
// The actual editor component
// ──────────────────────────────
function Editor({ pageId }: { pageId: string }) {
    const [currentJson, setCurrentJson] = useState<ReturnType<EditorState['toJSON']> | null>(null);
    const [registeredNodes, setRegisteredNodes] = useState<string[]>([]);

    const initialConfig = {
        namespace: 'NotionClone',
        theme,
        onError,
        // Register all node types
        nodes: [
            BlockNode,
            HeadingNode,
            QuoteNode,
            ListNode,
            ListItemNode,
            CodeNode,
            CodeHighlightNode,
            LinkNode,
        ],
        editorState: () => {
            const root = $getRoot();
            if (root.getChildrenSize() === 0) {
                const paragraph = $createParagraphNode();
                paragraph.append($createTextNode('Start typing...'));
                root.append(paragraph);
            }
        },
    };

    // Extract node types for display
    const nodeTypes = initialConfig.nodes.map((node) => node.getType());
    if (registeredNodes.length === 0 && nodeTypes.length > 0) {
        setRegisteredNodes(nodeTypes);
    }

    return (
        <div className="mx-auto max-w-7xl p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Lexical Editor</h1>
                <p className="text-gray-600">Page ID: {pageId}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Editor Panel */}
                <div className="border rounded-lg p-4 bg-white">
                    <h2 className="text-xl font-semibold mb-4">Editor</h2>
                    <LexicalComposer initialConfig={initialConfig}>
                        <div className="relative">
                            <RichTextPlugin
                                contentEditable={
                                    <ContentEditable className="min-h-[400px] max-w-none outline-none focus:outline-none p-4 border rounded" />
                                }
                                placeholder={
                                    <div className="pointer-events-none absolute top-4 left-4 text-gray-400">
                                        Start typing…
                                    </div>
                                }
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                            <HistoryPlugin />
                            <AutoFocusPlugin />
                            <MyOnChangePlugin onJsonChange={setCurrentJson} />
                        </div>
                    </LexicalComposer>
                </div>

                {/* Schema & Data Panel */}
                <div className="space-y-4">
                    {/* Registered Nodes */}
                    <div className="border rounded-lg p-4 bg-white">
                        <h2 className="text-xl font-semibold mb-3">Registered Nodes</h2>
                        <div className="space-y-1">
                            {registeredNodes.map((nodeType) => (
                                <div key={nodeType} className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <code className="text-sm font-mono">{nodeType}</code>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Current JSON State */}
                    <div className="border rounded-lg p-4 bg-white">
                        <h2 className="text-xl font-semibold mb-3">Current JSON State</h2>
                        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-[500px] font-mono">
                            {currentJson ? JSON.stringify(currentJson, null, 2) : 'Edit the document to see JSON...'}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Page() {
    return <Editor pageId="demo-123" />;
}
