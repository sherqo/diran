// page.tsx - Lexical Editor with Change Tracking
'use client';

import { useRef, useState } from 'react';
import { $getRoot, $createParagraphNode, $createTextNode, EditorState, SerializedEditorState, SerializedLexicalNode } from 'lexical';
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

// ──────────────────────────────
// Types for change tracking
// ──────────────────────────────
type NodeChange = {
    nodeKey: string;
    type: 'added' | 'deleted' | 'modified';
    nodeType: string;
    timestamp: string;
    content?: string;
    before?: SerializedLexicalNode;
    after?: SerializedLexicalNode;
};

type NodeMap = Map<string, SerializedLexicalNode>;

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
// Helper: Extract all nodes from serialized state
// ──────────────────────────────
function extractNodes(serializedState: SerializedEditorState): NodeMap {
    const nodeMap: NodeMap = new Map();
    
    function traverse(node: Record<string, unknown>) {
        if (node && typeof node === 'object') {
            // Store node by its type
            if ('type' in node && 'children' in node) {
                const nodeType = node.type as string;
                nodeMap.set(nodeType, node as SerializedLexicalNode);
            }
            
            // Traverse children
            if ('children' in node && Array.isArray(node.children)) {
                node.children.forEach((child: unknown) => traverse(child as Record<string, unknown>));
            }
        }
    }
    
    if (serializedState.root) {
        traverse(serializedState.root as Record<string, unknown>);
    }
    
    return nodeMap;
}

// ──────────────────────────────
// Detect changes between two states
// ──────────────────────────────
function detectChanges(previousState: SerializedEditorState | null, currentState: SerializedEditorState): NodeChange[] {
    if (!previousState) return [];
    
    const changes: NodeChange[] = [];
    const prevNodes = extractNodes(previousState);
    const currNodes = extractNodes(currentState);
    const timestamp = new Date().toISOString();
    
    // Find added and modified nodes
    currNodes.forEach((currNode, key) => {
        const prevNode = prevNodes.get(key);
        
        if (!prevNode) {
            // Node was added
            changes.push({
                nodeKey: key,
                type: 'added',
                nodeType: currNode.type,
                timestamp,
                content: JSON.stringify(currNode, null, 2),
                after: currNode,
            });
        } else {
            // Check if modified
            const prevJson = JSON.stringify(prevNode);
            const currJson = JSON.stringify(currNode);
            
            if (prevJson !== currJson) {
                changes.push({
                    nodeKey: key,
                    type: 'modified',
                    nodeType: currNode.type,
                    timestamp,
                    before: prevNode,
                    after: currNode,
                });
            }
        }
    });
    
    // Find deleted nodes
    prevNodes.forEach((prevNode, key) => {
        if (!currNodes.has(key)) {
            changes.push({
                nodeKey: key,
                type: 'deleted',
                nodeType: prevNode.type,
                timestamp,
                content: JSON.stringify(prevNode, null, 2),
                before: prevNode,
            });
        }
    });
    
    return changes;
}

// ──────────────────────────────
// Plugin to track changes and call APIs
// ──────────────────────────────
function ChangeTrackingPlugin({
    onJsonChange,
    onChangesDetected,
}: {
    onJsonChange: (json: SerializedEditorState) => void;
    onChangesDetected: (changes: NodeChange[]) => void;
}) {
    const previousState = useRef<SerializedEditorState | null>(null);

    const handleChange = (editorState: EditorState) => {
        const json = editorState.toJSON();
        
        // Detect what changed
        const changes = detectChanges(previousState.current, json);
        
        if (changes.length > 0) {
            onChangesDetected(changes);
            
            // Here's where you call your APIs for each change
            changes.forEach((change) => {
                switch (change.type) {
                    case 'added':
                        console.log('🟢 API Call: Add Node', {
                            nodeKey: change.nodeKey,
                            nodeType: change.nodeType,
                            data: change.after,
                        });
                        // fetch('/api/nodes/add', {
                        //     method: 'POST',
                        //     body: JSON.stringify({ nodeKey: change.nodeKey, data: change.after })
                        // });
                        break;
                        
                    case 'deleted':
                        console.log('🔴 API Call: Delete Node', {
                            nodeKey: change.nodeKey,
                        });
                        // fetch(`/api/nodes/${change.nodeKey}`, {
                        //     method: 'DELETE',
                        // });
                        break;
                        
                    case 'modified':
                        console.log('🟡 API Call: Update Node', {
                            nodeKey: change.nodeKey,
                            before: change.before,
                            after: change.after,
                        });
                        // fetch(`/api/nodes/${change.nodeKey}`, {
                        //     method: 'PATCH',
                        //     body: JSON.stringify({ data: change.after })
                        // });
                        break;
                }
            });
        }
        
        previousState.current = json;
        onJsonChange(json);
    };

    return <OnChangePlugin onChange={handleChange} ignoreSelectionChange />;
}

// ──────────────────────────────
// The actual editor component
// ──────────────────────────────
function Editor({ pageId }: { pageId: string }) {
    const [currentJson, setCurrentJson] = useState<SerializedEditorState | null>(null);
    const [registeredNodes, setRegisteredNodes] = useState<string[]>([]);
    const [changes, setChanges] = useState<NodeChange[]>([]);
    
    const handleChangesDetected = (newChanges: NodeChange[]) => {
        // Keep last 20 changes for display
        setChanges(prev => [...newChanges, ...prev].slice(0, 20));
    };

    const initialConfig = {
        namespace: 'NotionClone',
        theme,
        onError,
        // Register all node types
        nodes: [BlockNode, HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, CodeHighlightNode, LinkNode],
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
    const nodeTypes = initialConfig.nodes.map(node => node.getType());
    if (registeredNodes.length === 0 && nodeTypes.length > 0) {
        setRegisteredNodes(nodeTypes);
    }

    return (
        <div className="mx-auto max-w-7xl p-6">
            <div className="mb-6">
                <h1 className="mb-2 text-3xl font-bold">Lexical Editor</h1>
                <p className="text-gray-600">Page ID: {pageId}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Editor Panel */}
                <div className="rounded-lg border bg-white p-4">
                    <h2 className="mb-4 text-xl font-semibold">Editor</h2>
                    <LexicalComposer initialConfig={initialConfig}>
                        <div className="relative">
                            <RichTextPlugin
                                contentEditable={
                                    <ContentEditable className="min-h-[400px] max-w-none rounded border p-4 outline-none focus:outline-none" />
                                }
                                placeholder={<div className="pointer-events-none absolute top-4 left-4 text-gray-400">Start typing…</div>}
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                            <HistoryPlugin />
                            <AutoFocusPlugin />
                            <ChangeTrackingPlugin onJsonChange={setCurrentJson} onChangesDetected={handleChangesDetected} />
                        </div>
                    </LexicalComposer>
                </div>

                {/* Schema & Data Panel */}
                <div className="space-y-4">
                    {/* Change Log - API Calls to Make */}
                    <div className="rounded-lg border bg-white p-4">
                        <h2 className="mb-3 text-xl font-semibold">🔄 Changes (API Calls)</h2>
                        <div className="max-h-[300px] overflow-auto space-y-2">
                            {changes.length === 0 ? (
                                <p className="text-sm text-gray-500">No changes yet. Start editing...</p>
                            ) : (
                                changes.map((change, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded border-l-4 p-2 text-xs ${
                                            change.type === 'added'
                                                ? 'border-green-500 bg-green-50'
                                                : change.type === 'deleted'
                                                  ? 'border-red-500 bg-red-50'
                                                  : 'border-yellow-500 bg-yellow-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold">
                                                {change.type === 'added' && '🟢 ADD'}
                                                {change.type === 'deleted' && '🔴 DELETE'}
                                                {change.type === 'modified' && '🟡 UPDATE'}
                                            </span>
                                            <span className="text-gray-500">{new Date(change.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="font-mono">
                                            <div>Type: <span className="font-bold">{change.nodeType}</span></div>
                                            <div>Key: <span className="text-gray-600">{change.nodeKey}</span></div>
                                        </div>
                                        {/* API Call Example */}
                                        <details className="mt-2">
                                            <summary className="cursor-pointer text-blue-600 hover:underline">
                                                View API payload
                                            </summary>
                                            <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
                                                {change.type === 'added' && JSON.stringify({
                                                    method: 'POST',
                                                    url: '/api/nodes/add',
                                                    body: { nodeKey: change.nodeKey, data: change.after }
                                                }, null, 2)}
                                                {change.type === 'deleted' && JSON.stringify({
                                                    method: 'DELETE',
                                                    url: `/api/nodes/${change.nodeKey}`,
                                                }, null, 2)}
                                                {change.type === 'modified' && JSON.stringify({
                                                    method: 'PATCH',
                                                    url: `/api/nodes/${change.nodeKey}`,
                                                    body: { before: change.before, after: change.after }
                                                }, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Registered Nodes */}
                    <div className="rounded-lg border bg-white p-4">
                        <h2 className="mb-3 text-xl font-semibold">📦 Registered Nodes</h2>
                        <div className="space-y-1">
                            {registeredNodes.map(nodeType => (
                                <div key={nodeType} className="flex items-center space-x-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                    <code className="font-mono text-sm">{nodeType}</code>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Current JSON State */}
                    <div className="rounded-lg border bg-white p-4">
                        <h2 className="mb-3 text-xl font-semibold">📄 Current JSON Schema</h2>
                        <pre className="max-h-[400px] overflow-auto rounded bg-gray-50 p-3 font-mono text-xs">
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
