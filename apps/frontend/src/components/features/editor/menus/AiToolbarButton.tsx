'use client';

import React, { useEffect, useRef, useState } from 'react';
import AiPopupModal from './AiPopupModal';
import { Sparkles } from 'lucide-react';

export default function AiToolbarButton() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [selectionText, setSelectionText] = useState('');
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
        if (!text) return;

        try {
            const savedRange = sel.getRangeAt(0).cloneRange();
            (window as unknown as { __ai_saved_range?: Range }).__ai_saved_range = savedRange;
        } catch {}

        setPos(computePos());

        setSelectionText(text);
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
        // if (!input.trim() || loading) return;
        // setLoading(true);
        // try {
        //     const res = await fetch('/v1/extras/ai/assistant', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({ selectionText, prompt: input.trim() }),
        //     });
        //     const data = await res.json();
        //     const text = data?.data?.choices?.[0]?.text || 'No response';
        //     setMessages(m => [...m, text]);
        //     setInput('');
        // } catch {
        //     setMessages(m => [...m, 'Error']);
        // } finally {
        //     setLoading(false);
        // }
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
