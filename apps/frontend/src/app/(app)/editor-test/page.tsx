'use client';

import { Editor } from '@/components/features/editor/DynamicEditor';
// import type { BlockNoteEditor } from '@blocknote/core';
// import { useState, useCallback } from 'react';

export default function EditorTestPage() {
    // const [, setEditor] = useState<BlockNoteEditor | null>(null);

    // const handleEditorReady = useCallback((editorInstance: BlockNoteEditor) => {
    //     setEditor(editorInstance);

    //     // Setup onChange listener with detailed logging
    //     editorInstance.onChange((editor, { getChanges }) => {
    //         const changes = getChanges();

    //         if (changes.length === 0) return;

    //         console.log('📝 Document changed! Total changes:', changes.length);

    //         changes.forEach((change, index) => {
    //             console.log(`\n🔸 Change ${index + 1}:`);
    //             console.log('  Type:', change.type);
    //             console.log('  Source:', change.source.type);
    //             console.log('  Block ID:', change.block.id);
    //             console.log('  Block Type:', change.block.type);

    //             if (change.type === 'insert') {
    //                 console.log('  ✅ Inserted new block');
    //                 console.log('  Content:', change.block.content);
    //             } else if (change.type === 'delete') {
    //                 console.log('  ❌ Deleted block');
    //                 console.log('  Was:', change.block.content);
    //             } else if (change.type === 'update') {
    //                 console.log('  ✏️  Updated block');
    //                 console.log('  Previous content:', change.prevBlock.content);
    //                 console.log('  New content:', change.block.content);
    //             } else if (change.type === 'move') {
    //                 console.log('  🔄 Moved block');
    //                 console.log('  Previous parent:', change.prevParent?.id || 'root');
    //                 console.log('  Current parent:', change.currentParent?.id || 'root');
    //             }
    //         });

    //         console.log('\n📄 Full document:', editor.document);
    //     });
    // }, []);

    return (
        <div className="container mx-auto p-8">
            <h1 className="mb-4 text-2xl font-bold">BlockNote Editor Test</h1>
            <p className="text-muted-foreground mb-4 text-sm">Open the browser console to see detailed change logs</p>
            <Editor
            //  onEditorReady={handleEditorReady}
            />
        </div>
    );
}
