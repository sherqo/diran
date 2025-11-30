// this file is responsible for managing the changes and pushing them to the backend

import { createBlockApi, deleteBlockApi, updateBlockApi } from '@/lib/api/block';
import { BlockTypeEnum } from '@/shared/types/block';
import { BlocksChanged, Block } from '@blocknote/core';

// the main function that handles editor changes
export const handleChanges = (changes: BlocksChanged, document: Block[], pageId) => {
    if (changes.length === 0) return;

    console.log('📝 Document changed! Total changes:', changes.length);

    changes.forEach((change, index) => {
        const changeType = change.type;
        const blockId = change.block.id;
        const newContent = change.block.content;

        switch (changeType) {
            case 'insert':
                console.log('i got into insert function');
                // ==================================
                const currentDocument = document;
                const orderingData = getBlockPositionInfo(currentDocument, change.block.id);

                console.log('  📍 Position Info:');
                console.log('    Block Index:', orderingData.index);
                console.log('    Parent ID:', orderingData.parentId || 'ROOT');
                console.log('    Is Root:', orderingData.isRoot);
                console.log('    Before Block ID:', orderingData.beforeBlockId);
                console.log('    After Block ID:', orderingData.afterBlockId);
                console.log('  🚀 Server Data:', orderingData);
                // ==================================
                createBlockApi({
                    id: blockId,
                    type: BlockTypeEnum.PARAGRAPH,
                    content: newContent,
                    parentId: pageId, // we should figure this out later
                    prevId: orderingData.beforeBlockId,
                    nextId: orderingData.afterBlockId,
                });
                break;
            case 'update':
                console.log('i got into update function');
                // ==================================
                const currentDocument1 = document;
                const orderingData1 = getBlockPositionInfo(currentDocument1, change.block.id);

                console.log('  📍 Position Info:');
                console.log('    Block Index:', orderingData1.index);
                console.log('    Parent ID:', orderingData1.parentId || 'ROOT');
                console.log('    Is Root:', orderingData1.isRoot);
                console.log('    Before Block ID:', orderingData1.beforeBlockId);
                console.log('    After Block ID:', orderingData1.afterBlockId);
                console.log('  🚀 Server Data:', orderingData1);
                // ==================================
                updateBlockApi(blockId, {
                    type: BlockTypeEnum.PARAGRAPH,
                    content: newContent,
                    parentId: orderingData1.parentId,
                    prevId: orderingData1.beforeBlockId,
                    nextId: orderingData1.afterBlockId,
                });
                break;
            case 'delete':
                console.log('i got into delete function');
                deleteBlockApi(blockId);
                break;
            default:
                console.warn('Unknown change type:', changeType);
        }

        // console.log(`Change ${index + 1}:`);
        // console.log('  Type:', change.type);
        // console.log('  Source:', change.source.type);

        console.log('===The Whole Block:', change.block);

        // console.log('  Block ID:', change.block.id);
        // console.log('  Block Type:', change.block.type);
    });

    console.log('\n📄 Full document:', document);
};

const handleAdd = () => {};
const handleDelete = () => {};
const handleUpdate = () => {};

// ================ helpers ================

/**
 * Recursively searches for a block in the document tree
 * Returns the block's parent, siblings, and position info
 */
function findBlockInTree(
    blocks: Block[],
    targetId: string,
    parent: Block | null = null
): {
    block: Block;
    parent: Block | null;
    siblings: Block[];
    index: number;
} | null {
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        if (block.id === targetId) {
            return {
                block,
                parent,
                siblings: blocks,
                index: i,
            };
        }

        // Search in children
        if (block.children && block.children.length > 0) {
            const found = findBlockInTree(block.children, targetId, block);
            if (found) return found;
        }
    }

    return null;
}

/**
 * Calculates the position info for a block
 * Works with nested blocks (children of other blocks)
 * Returns the IDs of blocks before and after, plus parent info
 */
export function getBlockPositionInfo(document: Block[], blockId: string) {
    const result = findBlockInTree(document, blockId);

    if (!result) {
        throw new Error(`Block with ID ${blockId} not found in document`);
    }

    const { parent, siblings, index } = result;

    const beforeBlockId = index > 0 ? siblings[index - 1].id : null;
    const afterBlockId = index < siblings.length - 1 ? siblings[index + 1].id : null;
    const parentId = parent ? parent.id : null;
    const isRoot = parent === null;

    return {
        blockId,
        beforeBlockId,
        afterBlockId,
        parentId,
        isRoot,
        index,
    };
}
