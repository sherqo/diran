'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SendHorizonalIcon } from 'lucide-react';

interface Props {
    open: boolean;
    pos: { x: number; y: number };
    messages: string[];
    input: string;
    loading: boolean;
    onChange: (v: string) => void;
    onSubmit: () => void;
    onClose: () => void;
}

export default function AiPopupModal({ open, pos, messages, input, loading, onChange, onSubmit, onClose }: Props) {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) onClose();
        };
        const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onEsc);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onEsc);
        };
    }, [open, onClose]);

    if (!open) return null;

    const node = (
        <div ref={ref} className="fixed z-9999 w-180 rounded-lg bg-transparent p-3 shadow-lg" style={{ left: pos.x, top: pos.y }}>
            {messages.length > 0 && (
                <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
                    {messages.map((msg, i) => (
                        <div key={i} className="bg-muted border-input rounded border-2 px-3 py-2 text-sm shadow-md">
                            {msg}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <div className="border-input bg-card relative overflow-hidden rounded-md border-2 shadow-md">
                        <input
                            type="text"
                            value={input}
                            onChange={e => onChange(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && onSubmit()}
                            placeholder="Ask AI..."
                            className="w-full border-0 bg-transparent px-3 py-2 pr-12 text-base focus:outline-none"
                            autoFocus
                            disabled={loading}
                        />

                        <button
                            type="button"
                            aria-label="Send"
                            onClick={onSubmit}
                            disabled={loading || !input.trim()}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full shadow-md disabled:pointer-events-none disabled:opacity-50">
                            <SendHorizonalIcon className="size-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(node, document.body);
}
