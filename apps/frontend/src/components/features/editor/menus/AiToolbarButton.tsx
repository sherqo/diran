'use client';

import React, { useEffect, useRef, useState } from 'react';
import AiPopupModal from './AiPopupModal';
import { Sparkles } from 'lucide-react';
import { AiRequest, AiResponseData, AiBlockOperation } from '@diran/shared';
import { apiRequest } from '@/lib/api/helpers';
import { useBlockNoteEditor } from '@blocknote/react';

export default function AiToolbarButton() {
    const editor = useBlockNoteEditor();
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [selectedText, setSelectedText] = useState('');
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const computePos = () => {
        const el = buttonRef.current;
        if (!el) return { x: 0, y: 0 };
        const toolbar = el.closest(
            '.bn-formatting-toolbar, .bn-toolbar, .bn-floating-toolbar, [data-bn-formatting-toolbar]'
        ) as HTMLElement | null;
        const refRect = toolbar ? toolbar.getBoundingClientRect() : el.getBoundingClientRect();
        let left = refRect.left + refRect.width / 2 - 144 - 6; // 144 = 288/2, offset 6px left
        left = Math.max(8, Math.min(left, (window.innerWidth || document.documentElement.clientWidth) - 288 - 8));
        const top = refRect.bottom + 8;
        return { x: Math.round(left), y: Math.round(top) };
    };

    const handleOpen = () => {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return;
        const text = sel.toString().trim();

        if (text) {
            try {
                const savedRange = sel.getRangeAt(0).cloneRange();
                (window as unknown as { __ai_saved_range?: Range }).__ai_saved_range = savedRange;
            } catch {}
        }

        setPos(computePos());
        setSelectedText(text);
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return;
        const btn = buttonRef.current;
        if (!btn) return;

        const update = () => setPos(computePos());
        update();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [open]);

    const handleSubmit = async () => {
        if (!input.trim() || loading) return;

        setLoading(true);
        try {
            // Get current block context
            const textCursorPosition = editor.getTextCursorPosition();
            const currentBlock = textCursorPosition.block;

            // Get surrounding blocks for context (3 before, 3 after)
            const allBlocks = editor.document;
            const currentIndex = allBlocks.findIndex(b => b.id === currentBlock.id);
            const contextBlocks = allBlocks.slice(Math.max(0, currentIndex - 1), Math.min(allBlocks.length, currentIndex + 2)).map(b => ({
                id: b.id,
                type: b.type,
                content: b.content,
            }));

            const requestBody: AiRequest = {
                prompt: input.trim(),
                selectedText: selectedText || undefined,
                currentBlock: {
                    id: currentBlock.id,
                    type: currentBlock.type,
                    content: currentBlock.content,
                },
                documentContext: contextBlocks,
            };

            const response = await apiRequest<AiResponseData>('/ai', {
                method: 'POST',
                body: JSON.stringify(requestBody),
            });

            if (!response.success) {
                setMessages(m => [...m, 'Error: ' + (response.error?.message || 'Failed to get AI response')]);
                return;
            }

            const data = response.data;

            console.log('[AI] Response:', data);

            // Handle based on response type
            if (data.type === 'edit' && data.operations && data.operations.length > 0) {
                console.log('[AI] Applying operations:', data.operations);
                applyOperations(data.operations);
                setMessages(m => [...m, `✓ Applied ${data.operations!.length} edit(s)`]);
                setOpen(false);
            } else if (data.type === 'message' && data.message) {
                console.log('[AI] Showing message');
                setMessages(m => [...m, data.message!]);
            } else {
                console.warn('[AI] Unknown response format:', data);
                setMessages(m => [...m, 'Received unexpected response']);
            }

            setInput('');
        } catch (error) {
            console.error('AI request failed:', error);
            setMessages(m => [...m, 'Error: Network error occurred']);
        } finally {
            setLoading(false);
        }
    };

    // Apply AI operations to the editor
    const applyOperations = (operations: AiBlockOperation[]) => {
        console.log('[AI] applyOperations called with:', operations);
        for (const op of operations) {
            try {
                console.log('[AI] Processing operation:', op);
                if (op.op === 'replace' || op.op === 'update') {
                    // Update block content
                    const block = editor.document.find(b => b.id === op.blockId);
                    console.log('[AI] Found block for update:', block);
                    if (block) {
                        console.log('[AI] Updating block with content:', op.content);
                        editor.updateBlock(block, {
                            content: op.content,
                        });
                    }
                } else if (op.op === 'insert') {
                    // Insert new blocks after specified block
                    if (op.afterBlockId) {
                        const afterBlock = editor.document.find(b => b.id === op.afterBlockId);
                        console.log('[AI] Found afterBlock for insert:', afterBlock);
                        if (afterBlock && op.blocks) {
                            console.log('[AI] Inserting blocks:', op.blocks);
                            editor.insertBlocks(op.blocks as any, afterBlock, 'after');
                        }
                    } else {
                        // Insert at the end if no afterBlockId
                        console.log('[AI] Inserting blocks at end:', op.blocks);
                        const lastBlock = editor.document[editor.document.length - 1];
                        if (lastBlock && op.blocks) {
                            editor.insertBlocks(op.blocks as any, lastBlock, 'after');
                        }
                    }
                } else if (op.op === 'delete') {
                    // Delete block
                    const block = editor.document.find(b => b.id === op.blockId);
                    console.log('[AI] Found block for delete:', block);
                    if (block) {
                        editor.removeBlocks([block]);
                    }
                }
            } catch (err) {
                console.error('Failed to apply operation:', op, err);
            }
        }
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleOpen}
                className="bn-button py-auto px-auto hover:bg-accent flex h-8 items-center justify-center p-1"
                title="Ask AI">
                <Sparkles className="size-3" />
                <span className="ml-2 text-sm">Ask AI</span>
            </button>

            <AiPopupModal
                open={open}
                pos={pos}
                messages={messages}
                input={input}
                loading={loading}
                onChange={setInput}
                onSubmit={handleSubmit}
                onClose={() => setOpen(false)}
            />
        </div>
    );
}
