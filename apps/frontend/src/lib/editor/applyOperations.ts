import type { BlockNoteEditor } from '@blocknote/core';
import type { BlockOperation } from '@/shared/types/collaboration';

/**
 * Apply block operations to the BlockNote editor
 * Used by AI and Collaboration features
 */
export function applyBlockOperations(editor: BlockNoteEditor, operations: BlockOperation[], logPrefix = '[Operations]'): void {
    for (const operation of operations) {
        try {
            console.log(`${logPrefix} Processing:`, operation);

            switch (operation.op) {
                case 'insert': {
                    // Insert a new block after the specified block
                    if (operation.afterBlockId) {
                        const afterBlock = editor.document.find((b: { id: string }) => b.id === operation.afterBlockId);
                        if (afterBlock) {
                            editor.insertBlocks([operation.block as Parameters<typeof editor.insertBlocks>[0][0]], afterBlock, 'after');
                        }
                    } else {
                        // Insert at the beginning
                        const firstBlock = editor.document[0];
                        if (firstBlock) {
                            editor.insertBlocks([operation.block as Parameters<typeof editor.insertBlocks>[0][0]], firstBlock, 'before');
                        }
                    }
                    break;
                }

                case 'update': {
                    // Update an existing block
                    const block = editor.document.find((b: { id: string }) => b.id === operation.blockId);
                    if (block) {
                        editor.updateBlock(block, operation.changes as Parameters<typeof editor.updateBlock>[1]);
                    }
                    break;
                }

                case 'delete': {
                    // Remove a block
                    const block = editor.document.find((b: { id: string }) => b.id === operation.blockId);
                    if (block) {
                        editor.removeBlocks([block]);
                    }
                    break;
                }

                case 'move': {
                    console.log(`${logPrefix} Move operation - handled via delete/insert`);
                    break;
                }

                case 'bulk-update': {
                    console.log(`${logPrefix} Bulk update operation`);
                    // for later
                    break;
                }
            }
        } catch (err) {
            console.error(`${logPrefix} Failed to apply operation:`, operation, err);
        }
    }
}
