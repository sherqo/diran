'use client';

import { useRef, useState } from 'react';
import { SimpleEditor, SimpleEditorRef } from '@/components/features/editor';
import { OutputData } from '@editorjs/editorjs';

export default function EditorTestPage() {
    const editorRef = useRef<SimpleEditorRef>(null);
    const [savedData, setSavedData] = useState<OutputData | null>(null);

    // When you want to get the data from the editor
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
            <h1 className="mb-6 text-3xl font-bold">Simple Editor Example</h1>

            {/* The Editor - that's it! */}
            <div className="bg-card mb-4 rounded-lg border p-6">
                <SimpleEditor ref={editorRef} placeholder="Type something..." />
            </div>

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

            {/* Explanation */}
            <div className="mt-8 space-y-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                    <h3 className="mb-2 font-semibold">How to use:</h3>
                    <ol className="list-inside list-decimal space-y-1 text-sm">
                        <li>Type in the editor above</li>
                        <li>Click &quot;Get Data&quot; when you want the content</li>
                        <li>See the JSON output below</li>
                        <li>Do whatever you want with that data!</li>
                    </ol>
                </div>

                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                    <h3 className="mb-2 font-semibold">What you get:</h3>
                    <p className="text-sm">
                        The editor gives you a JSON object with all the content. You decide when and how to save it to your backend.
                    </p>
                </div>
            </div>
        </div>
    );
}
