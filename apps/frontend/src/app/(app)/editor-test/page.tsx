'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { EditorRef } from '@/components/features/editor';
import { OutputData } from '@sharqawycs/editorjs';

// Dynamically import the editor to avoid SSR issues
const Editor = dynamic(() => import('@/components/features/editor').then(mod => mod.Editor), { ssr: false });

export default function EditorTestPage() {
    const editorRef = useRef<EditorRef>(null);
    const [savedData, setSavedData] = useState<OutputData | null>(null);

    // ! Deadass --- When you want to get the data from the editor
    const handleSave = async () => {
        try {
            const data = await editorRef.current?.save();
            console.log('Editor data:', data);
            setSavedData(data || null);

            // NOW you decide what to do with this data:
            // - Send to your backend API
            // - Store in localStorage
            // - Use it however you want

            alert('Data saved! Check console');
        } catch (error) {
            console.error('Error saving:', error);
        }
    };

    const handleClear = async () => {
        await editorRef.current?.clear();
        setSavedData(null);
    };

    return (
        <div className="container mx-auto max-w-4xl py-8">
            {/* The Editor - that's it! */}
            <div className="bg-card mb-4 rounded-lg border p-6">
                <Editor ref={editorRef} placeholder="Type something..." />
            </div>

            {/* deadass dickhead stuff --- do not care about it at all for now */}

            {/* Manual controls - YOU decide when to save */}
            <div className="flex gap-2">
                <button
                    onClick={handleSave}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium">
                    Get Data (Save)
                </button>
                <button onClick={handleClear} className="hover:bg-accent rounded-md border px-4 py-2 text-sm font-medium">
                    Clear Editor
                </button>
            </div>

            {/* Show what the editor outputs */}
            {savedData && (
                <div className="bg-muted mt-6 rounded-lg border p-4">
                    <h2 className="mb-2 font-semibold">Editor Output:</h2>
                    <pre className="overflow-auto text-xs">{JSON.stringify(savedData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
