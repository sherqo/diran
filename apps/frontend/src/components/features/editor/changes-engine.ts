// this file is responsible for managing the changes and pushing them to the backend

import { createBlockApi, deleteBlockApi, updateBlockApi } from '@/lib/api/block';
import { BlockTypeEnum } from '@/shared/types/block';
import { BlocksChanged, Block } from '@blocknote/core';

// the main function that handles editor changes
export const handleChanges = (changes: BlocksChanged, document: Block[], pageId: string) => {
    if (changes.length === 0) return;

    console.log('📝 Document changed! Total changes:', changes.length);

    changes.forEach(change => {
        const newBlock = change.block;
        const oldBlock = change.prevBlock;

        const changeType = change.type;
        switch (changeType) {
            case 'insert':
                console.log('i got into insert function');
                handleInsert(document, newBlock, pageId);
                break;
            case 'delete':
                console.log('i got into delete function');
                handleDelete(newBlock.id);
                break;
            case 'update':
                console.log('i got into update function');
                handleUpdate(oldBlock!, newBlock);
                break;
            case 'move':
                console.log('i got into move function');
                const isParentChanged = change.currentParent?.id !== change.prevParent?.id;
                handleMove(document, newBlock, pageId, isParentChanged);
                break;
            default:
                console.warn('Unknown change type:', changeType);
        }
    });

    console.log('\n📄 Full document:', document);
};

// ================ changes handlers ================
// insert is kinda ez, just create the block with its data and send to the backend...
const handleInsert = (currentDocument: Block[], newBlock: Block, pageId: string) => {
    const posInfo = getBlockPositionInfo(currentDocument, newBlock.id, pageId);

    createBlockApi({
        id: newBlock.id,
        type: newBlock.type.toUpperCase() as BlockTypeEnum,
        content: newBlock.content,
        parentId: posInfo.parentId,
        prevId: posInfo.beforeBlockId,
        nextId: posInfo.afterBlockId,
    });
};

// deleting is also ez, just send the block id and the server will do it...
const handleDelete = (deletedBlockId: string) => {
    deleteBlockApi(deletedBlockId);
};

// the update is so tricky, u need to get the old content, compare it with the new content, and send only the changed fields
// we also 'move' the move changes the position like: parent, prev, next
// while the update does not change the position, just the content or the type, so, no need to play with positioning
const handleUpdate = (oldBlock: Block, newBlock: Block) => {
    const changes: Partial<{
        type: BlockTypeEnum;
        content: Block['content'];
    }> = {
        ...(oldBlock.type !== newBlock.type && { type: newBlock.type.toUpperCase() as BlockTypeEnum }),
        content: newBlock.content, // most of the time content will change, so we just send it directly, the check is expensive
    };

    if (Object.keys(changes).length > 0) {
        updateBlockApi(newBlock.id, changes);
    }
};

const handleMove = (currentDocument: Block[], movedBlock: Block, pageId: string, isParentChanged: boolean) => {
    const posInfo = getBlockPositionInfo(currentDocument, movedBlock.id, pageId);

    updateBlockApi(movedBlock.id, {
        ...(isParentChanged && { parentId: posInfo.parentId }),
        prevId: posInfo.beforeBlockId,
        nextId: posInfo.afterBlockId,
    });
};

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
export function getBlockPositionInfo(document: Block[], blockId: string, pageId: string) {
    const result = findBlockInTree(document, blockId);

    if (!result) {
        throw new Error(`Block with ID ${blockId} not found in document`);
    }

    const { parent, siblings, index } = result;

    const beforeBlockId = index > 0 ? siblings[index - 1].id : null;
    const afterBlockId = index < siblings.length - 1 ? siblings[index + 1].id : null;
    const parentId = parent ? parent.id : pageId;

    return {
        blockId,
        beforeBlockId,
        afterBlockId,
        parentId,
        index,
    };
}
