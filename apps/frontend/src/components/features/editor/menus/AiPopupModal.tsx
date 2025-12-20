'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SendHorizonalIcon, Loader2Icon, SparklesIcon } from 'lucide-react';

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
        <div ref={ref} className="fixed z-9999 w-180 animate-[fadeIn_0.2s_ease-out]" style={{ left: pos.x, top: pos.y }}>
            <div className="bg-background/95 border-border rounded-lg border p-3 shadow-2xl backdrop-blur-sm">
                {/* Messages */}
                {messages.length > 0 && (
                    <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className="bg-muted/50 border-border/50 animate-[slideIn_0.3s_ease-out] rounded-md border px-3 py-2 text-sm shadow-sm backdrop-blur-sm"
                                style={{
                                    animationDelay: `${i * 50}ms`,
                                    opacity: 0,
                                    animationFillMode: 'forwards',
                                }}>
                                <div className="flex items-start gap-2">
                                    <SparklesIcon className="text-primary mt-0.5 size-4 shrink-0" />
                                    <span className="flex-1">{msg}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <div className="bg-card border-input focus-within:ring-primary/20 relative overflow-hidden rounded-md border shadow-sm transition-shadow duration-200 focus-within:shadow-md focus-within:ring-2 hover:shadow-md">
                            <input
                                type="text"
                                value={input}
                                onChange={e => onChange(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !loading && onSubmit()}
                                placeholder="Ask AI..."
                                className="w-full border-0 bg-transparent px-3 py-2 pr-12 text-base focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                autoFocus
                                disabled={loading}
                            />

                            <button
                                type="button"
                                aria-label="Send"
                                onClick={onSubmit}
                                disabled={loading || !input.trim()}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100">
                                {loading ? <Loader2Icon className="size-4 animate-spin" /> : <SendHorizonalIcon className="size-4" />}
                            </button>
                        </div>

                        {/* Loading indicator bar */}
                        {loading && (
                            <div className="bg-primary/20 absolute right-0 -bottom-1 left-0 h-0.5 overflow-hidden rounded-full">
                                <div
                                    className="bg-primary h-full animate-[shimmer_1.5s_ease-in-out_infinite]"
                                    style={{
                                        backgroundImage: 'linear-gradient(90deg, transparent, currentColor, transparent)',
                                        backgroundSize: '200% 100%',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(node, document.body);
}
