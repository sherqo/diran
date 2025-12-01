// this file is responsible for managing the changes and pushing them to the backend

import { createBlockApi, deleteBlockApi, updateBlockApi } from '@/lib/api/block';
import { BlockTypeEnum } from '@/shared/types/block';
import { BlocksChanged, Block } from '@blocknote/core';

// ================ Changes Engine ================
/**
 * Two-map changes engine:
 * - Map A: Active changes buffer (user is typing)
 * - Map B: Sync queue (waiting to be sent to server)
 *
 * Flow:
 * 1. Changes go to Map A immediately
 * 2. After DEBOUNCE_MS ms of inactivity, Map A → Map B
 * 3. Map B tries to sync with server
 * 4. While syncing, Map A cannot push to Map B
 * 5. On network error, Map B retries (Map A still blocked)
 */

type ChangeOperation =
    | { type: 'create'; data: Parameters<typeof createBlockApi>[0] }
    | { type: 'update'; blockId: string; data: Parameters<typeof updateBlockApi>[1] }
    | { type: 'delete'; blockId: string };

class ChangesEngine {
    private mapA: Map<string, ChangeOperation> = new Map(); // active buffer
    private mapB: Map<string, ChangeOperation> = new Map(); // sync queue
    private isSyncing: boolean = false;
    private debounceTimer: NodeJS.Timeout | null = null;
    private readonly DEBOUNCE_MS = 5000;
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY_MS = 1000;

    addChange(blockId: string, operation: ChangeOperation) {
        // Resolve operation with existing one (if any)
        const resolved = this.resolveOperation(blockId, operation);

        if (resolved === null) {
            // operations cancelled each other => remove from Map A
            this.mapA.delete(blockId);
        } else {
            // add resolved operation to Map A
            this.mapA.set(blockId, resolved);
        }

        this.resetDebounce();
    }

    private resolveOperation(blockId: string, newOp: ChangeOperation): ChangeOperation | null {
        const existingOp = this.mapA.get(blockId); // we should only have one operation per block in Map A

        if (!existingOp) {
            // no conflict
            return newOp;
        }

        console.log(`🔄 [Resolver] Resolving: ${existingOp.type} + ${newOp.type} for block ${blockId}`);

        // Case 1: create + update → create (with merged data)
        if (existingOp.type === 'create' && newOp.type === 'update') {
            return {
                type: 'create',
                data: {
                    ...existingOp.data,
                    ...newOp.data,
                },
            };
        }

        // Case 2: create + delete → null (cancel both - block never existed on server)
        if (existingOp.type === 'create' && newOp.type === 'delete') {
            return null;
        }

        // Case 3: update + update → update (merge data)
        if (existingOp.type === 'update' && newOp.type === 'update') {
            return {
                type: 'update',
                blockId: newOp.blockId,
                data: {
                    ...existingOp.data,
                    ...newOp.data,
                },
            };
        }

        // Case 4: update + delete → delete (skip update, just delete)
        if (existingOp.type === 'update' && newOp.type === 'delete') {
            return newOp;
        }

        // Case 5: delete + anything → delete (block is already deleted, ignore new ops)
        if (existingOp.type === 'delete') {
            return existingOp;
        }

        // Default: return new operation (shouldn't reach here normally)
        console.warn(`⚠️ [Resolver] Unhandled case: ${existingOp.type} + ${newOp.type}`);
        return newOp;
    }

    private resetDebounce() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.moveAtoB();
        }, this.DEBOUNCE_MS);
    }

    private moveAtoB() {
        // cannot move if Map B is syncing - skill issue ^_^
        if (this.isSyncing) {
            console.log('⚠️ [MapA→MapB] Blocked: Map B is syncing');
            // reschedule later
            this.resetDebounce();
            return;
        }

        //  nth to move
        if (this.mapA.size === 0) {
            return;
        }

        // Move all items from A to B
        this.mapA.forEach((operation, blockId) => {
            this.mapB.set(blockId, operation);
        });

        this.mapA.clear();

        this.syncMapB();
    }

    private async syncMapB(retryCount: number = 0) {
        if (this.mapB.size === 0) {
            return;
        }

        if (this.isSyncing) {
            return;
        }

        this.isSyncing = true;

        const operations = Array.from(this.mapB.entries());
        const errors: Array<{ blockId: string; error: any }> = [];

        // Execute all operations
        for (const [blockId, operation] of operations) {
            try {
                switch (operation.type) {
                    case 'create':
                        await createBlockApi(operation.data);
                        break;
                    case 'update':
                        await updateBlockApi(operation.blockId, operation.data);
                        break;
                    case 'delete':
                        await deleteBlockApi(operation.blockId);
                        break;
                }
                // Remove successful operation
                this.mapB.delete(blockId);
            } catch (error) {
                console.error(`❌ [MapB] Failed for block ${blockId}:`, error);
                errors.push({ blockId, error });
            }
        }

        // Check if we have errors and should retry
        if (errors.length > 0) {
            console.log(`⚠️ [MapB] ${errors.length} operations failed`);

            if (retryCount < this.MAX_RETRIES) {
                console.log(`🔄 [MapB] Retrying in ${this.RETRY_DELAY_MS}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);

                // Keep isSyncing=true during retry delay (blocks Map A)
                await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY_MS));

                // Retry
                await this.syncMapB(retryCount + 1);
            } else {
                console.error(`💥 [MapB] Max retries reached. ${this.mapB.size} operations remain in queue`);
                this.isSyncing = false;
                // TODO: Maybe notify user or persist failed operations
            }
        } else {
            // All successful
            console.log('✅ [MapB] Sync complete, all operations successful');
            this.isSyncing = false;

            // Check if Map A accumulated changes during sync
            if (this.mapA.size > 0) {
                console.log(`🔔 [MapB] Map A has ${this.mapA.size} pending changes, will move after debounce`);
            }
        }
    }

    // For debugging
    getStatus() {
        return {
            mapA: this.mapA.size,
            mapB: this.mapB.size,
            isSyncing: this.isSyncing,
        };
    }
}

// Singleton instance
const changesEngine = new ChangesEngine();

// the main function that handles editor changes - called from the editor component
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

    changesEngine.addChange(newBlock.id, {
        type: 'create',
        data: {
            id: newBlock.id,
            type: newBlock.type.toUpperCase() as BlockTypeEnum,
            content: newBlock.content,
            parentId: posInfo.parentId,
            prevId: posInfo.beforeBlockId,
            nextId: posInfo.afterBlockId,
        },
    });
};

// deleting is also ez, just send the block id and the server will do it...
const handleDelete = (deletedBlockId: string) => {
    changesEngine.addChange(deletedBlockId, {
        type: 'delete',
        blockId: deletedBlockId,
    });
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
        changesEngine.addChange(newBlock.id, {
            type: 'update',
            blockId: newBlock.id,
            data: changes,
        });
    }
};

const handleMove = (currentDocument: Block[], movedBlock: Block, pageId: string, isParentChanged: boolean) => {
    const posInfo = getBlockPositionInfo(currentDocument, movedBlock.id, pageId);

    changesEngine.addChange(movedBlock.id, {
        type: 'update',
        blockId: movedBlock.id,
        data: {
            ...(isParentChanged && { parentId: posInfo.parentId }),
            prevId: posInfo.beforeBlockId,
            nextId: posInfo.afterBlockId,
        },
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
