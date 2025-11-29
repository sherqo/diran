// this file is responsible for managing the changes and pushing them to the backend

import { BlocksChanged, Block } from '@blocknote/core';

// the main function that handles editor changes
export const handleChanges = (changes: BlocksChanged, document: Block[]) => {
    if (changes.length === 0) return;

    console.log('📝 Document changed! Total changes:', changes.length);

    changes.forEach((change, index) => {
        console.log(`\n🔸 Change ${index + 1}:`);
        console.log('  Type:', change.type);
        console.log('  Source:', change.source.type);

        console.log('  The Whole Block:', change.block);

        console.log('  Block ID:', change.block.id);
        console.log('  Block Type:', change.block.type);

        if (change.type === 'insert') {
            console.log('  ✅ Inserted new block');
            console.log('  Content:', change.block.content);
        } else if (change.type === 'delete') {
            console.log('  ❌ Deleted block');
            console.log('  Was:', change.block.content);
        } else if (change.type === 'update') {
            console.log('  ✏️  Updated block');
            console.log('  Previous content:', change.prevBlock.content);
            console.log('  New content:', change.block.content);
        } else if (change.type === 'move') {
            console.log('  🔄 Moved block');
            console.log('  Previous parent:', change.prevParent?.id || 'root');
            console.log('  Current parent:', change.currentParent?.id || 'root');

            // Get the current document structure and calculate position info
            const currentDocument = document;
            const orderingData = getBlockPositionInfo(currentDocument, change.block.id);

            console.log('  📍 Position Info:');
            console.log('    Block Index:', orderingData.newIndex);
            console.log('    Before Block ID:', orderingData.beforeBlockId);
            console.log('    After Block ID:', orderingData.afterBlockId);
            console.log('  🚀 Server Data:', orderingData);
        }
    });

    console.log('\n📄 Full document:', document);
};

// ================ helpers ================

/**
 * Calculates the position info for a moved block
 * Returns the IDs of blocks before and after the moved block
 */
export function getBlockPositionInfo(document: Block[], movedBlockId: string) {
    const blockIndex = document.findIndex(block => block.id === movedBlockId);

    if (blockIndex === -1) {
        throw new Error(`Block with ID ${movedBlockId} not found in document`);
    }

    const beforeBlockId = blockIndex > 0 ? document[blockIndex - 1].id : null;
    const afterBlockId = blockIndex < document.length - 1 ? document[blockIndex + 1].id : null;

    return {
        movedBlockId,
        beforeBlockId,
        afterBlockId,
        newIndex: blockIndex,
    };
}
