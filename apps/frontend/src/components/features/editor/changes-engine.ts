// this file is responsible for managing the changes and pushing them to the backend

import { createBlockApi, deleteBlockApi, updateBlockApi } from '@/lib/api/block';
import { BlockTypeEnum, EmbeddedBlockContent } from '@/shared/types/block';
import { ErrorCode } from '@/shared/constants/errors';
import { BlocksChanged, Block } from '@blocknote/core';

/**
 * Verbose per-change / per-request logging freezes the UI on large pastes
 * (full-document dumps on every keystroke). Enable only when debugging sync:
 * NEXT_PUBLIC_DEBUG_SYNC=true
 */
const DEBUG_SYNC = process.env.NEXT_PUBLIC_DEBUG_SYNC === 'true';
const debugLog = (...args: unknown[]) => {
    if (DEBUG_SYNC) console.log(...args);
};

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

export type SyncStatus = 'saved' | 'saving' | 'error';

type StatusListener = (status: SyncStatus) => void;

// Result of pushing one operation to the server.
export type SendResult = { ok: true } | { ok: false; rateLimited: boolean; retryable: boolean };

// Failures that will never succeed on retry (don't burn retries / block the queue).
const NON_RETRYABLE_CODES = new Set<string>([
    ErrorCode.VALIDATION_ERROR,
    ErrorCode.INVALID_INPUT,
    ErrorCode.NOT_FOUND,
    ErrorCode.PERMISSION_DENIED,
    ErrorCode.INVALID_PARENT_ID,
]);

/**
 * Pure operation merge: folds a new op into an existing queued op for the same block.
 * Returns null when the ops cancel each other out. Used for BOTH maps so a queued
 * (possibly failed, not-yet-sent) op is never clobbered by a newer one.
 */
export function resolveOperation(existingOp: ChangeOperation, newOp: ChangeOperation): ChangeOperation | null {
    debugLog(`[Resolver] Resolving: ${existingOp.type} + ${newOp.type}`);

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
    console.warn(`[Resolver] Unhandled case: ${existingOp.type} + ${newOp.type}`);
    return newOp;
}

/**
 * Pushes one operation to the server and classifies the outcome.
 * NOTE: apiRequest() resolves (does NOT throw) on HTTP errors like 429/500,
 * so `result.success` MUST be checked — previously failures were silently
 * dropped from the queue (data loss on fast pastes hitting the rate limit).
 */
export async function sendOperation(blockId: string, operation: ChangeOperation): Promise<SendResult> {
    try {
        let result: unknown;
        switch (operation.type) {
            case 'create':
                result = await createBlockApi(operation.data);
                break;
            case 'update':
                result = await updateBlockApi(operation.blockId, operation.data);
                break;
            case 'delete':
                result = await deleteBlockApi(operation.blockId);
                break;
        }

        if ((result as { success?: boolean } | null)?.success === true) {
            return { ok: true };
        }

        const code = (result as { error?: { code?: string } } | null)?.error?.code;
        const status = (result as { statusCode?: number } | null)?.statusCode;
        // @fastify/rate-limit errors don't use our {success,error} envelope — detect via status too.
        const rateLimited = code === ErrorCode.TOO_MANY_REQUESTS || status === 429;
        const retryable = rateLimited || !code || !NON_RETRYABLE_CODES.has(code);
        console.error(`❌ [Sync] ${operation.type} failed for block ${blockId}:`, code ?? status ?? 'unknown');
        return { ok: false, rateLimited, retryable };
    } catch (error) {
        // Network throw — always retryable.
        console.error(`❌ [Sync] ${operation.type} threw for block ${blockId}:`, error);
        return { ok: false, rateLimited: false, retryable: true };
    }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ChangesEngine {
    private mapA: Map<string, ChangeOperation> = new Map(); // active buffer
    private mapB: Map<string, ChangeOperation> = new Map(); // sync queue
    private isSyncing: boolean = false;
    private debounceTimer: NodeJS.Timeout | null = null;
    private autoRetryTimer: NodeJS.Timeout | null = null;
    private failCounts: Map<string, number> = new Map(); // poison-pill guard per block
    private readonly DEBOUNCE_MS = 1000;
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY_MS = 1000;
    private readonly SYNC_CONCURRENCY = 4; // parallel requests per flush (paste = many creates)
    private readonly RATE_LIMIT_PAUSE_MS = 60_000; // global limiter window is 1 minute
    private readonly MAX_RATE_LIMIT_PAUSES = 2;
    private readonly MAX_OP_FAILURES = 5; // drop poison pills so one bad block can't wedge the queue
    private readonly AUTO_RETRY_MS = 60_000; // re-flush leftovers even with no further typing
    private currentStatus: SyncStatus = 'saved';
    private listeners: Set<StatusListener> = new Set();

    // Subscribe to status changes
    onStatusChange(listener: StatusListener) {
        this.listeners.add(listener);
        // Immediately call with current status
        listener(this.currentStatus);
        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }

    private setStatus(status: SyncStatus) {
        if (this.currentStatus !== status) {
            this.currentStatus = status;
            this.listeners.forEach(listener => listener(status));
        }
    }

    addChange(blockId: string, operation: ChangeOperation) {
        // Resolve operation with existing one (if any) — one op per block in Map A
        const existingOp = this.mapA.get(blockId);
        const resolved = existingOp ? resolveOperation(existingOp, operation) : operation;

        if (resolved === null) {
            // operations cancelled each other => remove from Map A
            this.mapA.delete(blockId);
        } else {
            // add resolved operation to Map A
            this.mapA.set(blockId, resolved);
        }

        // Update status to saving since we have pending changes
        this.setStatus('saving');

        this.resetDebounce();
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
            debugLog('⚠️ [MapA→MapB] Blocked: Map B is syncing');
            // reschedule later
            this.resetDebounce();
            return;
        }

        //  nth to move
        if (this.mapA.size === 0) {
            return;
        }

        // Move all items from A to B, MERGING with any still-queued op for the
        // same block (e.g. a failed create awaiting retry). Overwriting here used
        // to turn create→update for blocks that don't exist server-side yet,
        // failing forever.
        this.mapA.forEach((operation, blockId) => {
            const existingOp = this.mapB.get(blockId);
            const resolved = existingOp ? resolveOperation(existingOp, operation) : operation;
            if (resolved === null) {
                this.mapB.delete(blockId);
                this.failCounts.delete(blockId);
            } else {
                this.mapB.set(blockId, resolved);
            }
        });

        this.mapA.clear();

        void this.syncMapB();
    }

    private clearAutoRetry() {
        if (this.autoRetryTimer) {
            clearTimeout(this.autoRetryTimer);
            this.autoRetryTimer = null;
        }
    }

    private scheduleAutoRetry() {
        // Leftover queue must not sit until the next keystroke (reload = data loss).
        this.clearAutoRetry();
        this.autoRetryTimer = setTimeout(() => {
            this.autoRetryTimer = null;
            if (this.mapB.size > 0 && !this.isSyncing) {
                debugLog(`🔔 [MapB] Auto-retrying ${this.mapB.size} leftover operations`);
                this.setStatus('saving');
                void this.syncMapB();
            }
        }, this.AUTO_RETRY_MS);
    }

    private async syncMapB(retryCount: number = 0, rateLimitPauses: number = 0) {
        if (this.mapB.size === 0) {
            return;
        }

        if (this.isSyncing) {
            return;
        }

        this.isSyncing = true;
        this.clearAutoRetry();

        const operations = Array.from(this.mapB.entries());
        let hasErrors = false;
        let sawRateLimit = false;

        // Worker pool: a fast paste queues hundreds of creates — strictly
        // sequential requests take minutes on serverless. Map order is preserved
        // at dispatch; per-block order is safe (one merged op per block).
        let cursor = 0;
        const workerCount = Math.min(this.SYNC_CONCURRENCY, operations.length);
        const worker = async () => {
            while (cursor < operations.length) {
                const entry = operations[cursor++];
                if (!entry) break;
                const [blockId, operation] = entry;
                // Skip if a newer flush already replaced this exact op object.
                if (this.mapB.get(blockId) !== operation) continue;

                const result = await sendOperation(blockId, operation);
                if (result.ok) {
                    if (this.mapB.get(blockId) === operation) this.mapB.delete(blockId);
                    this.failCounts.delete(blockId);
                } else if (!result.retryable) {
                    // Poison pill (validation/permission/404): drop so one bad block
                    // can't wedge the whole queue; surfaced via console + error status.
                    console.error(`💥 [MapB] Dropping non-retryable ${operation.type} for block ${blockId}`);
                    this.mapB.delete(blockId);
                    this.failCounts.delete(blockId);
                    hasErrors = true;
                } else {
                    if (result.rateLimited) {
                        sawRateLimit = true;
                    } else {
                        hasErrors = true;
                    }
                    const fails = (this.failCounts.get(blockId) ?? 0) + 1;
                    if (fails >= this.MAX_OP_FAILURES) {
                        console.error(`💥 [MapB] Dropping block ${blockId} after ${fails} failures`);
                        this.mapB.delete(blockId);
                        this.failCounts.delete(blockId);
                    } else {
                        this.failCounts.set(blockId, fails);
                    }
                }
            }
        };
        await Promise.all(Array.from({ length: workerCount }, () => worker()));

        this.isSyncing = false;

        if (this.mapB.size === 0) {
            // All successful
            debugLog('✅ [MapB] Sync complete, all operations successful');
            this.failCounts.clear();

            // Check if Map A accumulated changes during sync
            if (this.mapA.size > 0) {
                debugLog(`🔔 [MapB] Map A has ${this.mapA.size} pending changes, will move after debounce`);
                this.setStatus('saving');
            } else {
                this.setStatus('saved');
            }
            return;
        }

        // Queue still has items — decide how to retry.
        if (sawRateLimit && rateLimitPauses < this.MAX_RATE_LIMIT_PAUSES) {
            // Global limiter window is 1 minute: pause past it, then resume without
            // burning the normal retry budget.
            debugLog(`⏳ [MapB] Rate-limited, pausing ${this.RATE_LIMIT_PAUSE_MS}ms (pause ${rateLimitPauses + 1}/${this.MAX_RATE_LIMIT_PAUSES})`);
            this.setStatus('saving');
            await sleep(this.RATE_LIMIT_PAUSE_MS);
            await this.syncMapB(0, rateLimitPauses + 1);
        } else if (retryCount < this.MAX_RETRIES) {
            debugLog(`🔄 [MapB] Retrying in ${this.RETRY_DELAY_MS}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
            await sleep(this.RETRY_DELAY_MS);
            await this.syncMapB(retryCount + 1, rateLimitPauses);
        } else {
            console.error(`💥 [MapB] Max retries reached. ${this.mapB.size} operations remain in queue — will auto-retry`);
            this.setStatus('error');
            this.scheduleAutoRetry();
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

// Export function to subscribe to status changes
export const onSyncStatusChange = (listener: StatusListener) => {
    return changesEngine.onStatusChange(listener);
};

// the main function that handles editor changes - called from the editor component
export const handleChanges = (changes: BlocksChanged, document: Block[], pageId: string) => {
    if (changes.length === 0) return;

    debugLog('📝 Document changed! Total changes:', changes.length);

    // A fast paste yields one insert per pasted block in a single call.
    // Walking the whole tree per insert is O(paste × doc) — build the position
    // index once per call instead.
    const positionIndex = changes.some(c => c.type === 'insert' || c.type === 'move') ? buildPositionIndex(document, pageId) : null;

    changes.forEach(change => {
        const newBlock = change.block;
        const oldBlock = change.prevBlock;

        const changeType = change.type;
        switch (changeType) {
            case 'insert':
                handleInsert(newBlock, pageId, positionIndex);
                break;
            case 'delete':
                handleDelete(newBlock.id);
                break;
            case 'update':
                handleUpdate(oldBlock!, newBlock);
                break;
            case 'move':
                const isParentChanged = change.currentParent?.id !== change.prevParent?.id;
                handleMove(newBlock, pageId, isParentChanged, positionIndex);
                break;
            default:
                console.warn('Unknown change type:', changeType);
        }
    });
};

// ================ helpers for props handling ================
/**
 * BlockNote stores props (colors, alignment, level, etc.) at the same level as content.
 * Backend only stores content as JSON, so we embed props inside content for storage.
 * Format: { __props: {...}, __content: ... } - content can be array (text blocks), object (tables), or undefined (embeds)
 */
const embedPropsInContent = (block: Block): EmbeddedBlockContent => {
    const props = block.props || {};
    // Content can be: InlineContent[] for text blocks, TableContent for tables, or undefined for embeds
    const content = block.content;

    return {
        __props: props as EmbeddedBlockContent['__props'],
        __content: content as EmbeddedBlockContent['__content'],
    };
};

// ================ changes handlers ================
// insert is kinda ez, just create the block with its data and send to the backend...
const handleInsert = (newBlock: Block, pageId: string, positionIndex: Map<string, BlockPosition> | null) => {
    const posInfo = getPositionForBlock(positionIndex, newBlock.id, pageId);

    changesEngine.addChange(newBlock.id, {
        type: 'create',
        data: {
            id: newBlock.id,
            type: newBlock.type as BlockTypeEnum, // BlockNote types are already lowercase
            // Cast to unknown first since we're changing the content structure for storage
            content: embedPropsInContent(newBlock) as unknown as Block['content'],
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
        content: EmbeddedBlockContent;
    }> = {
        ...(oldBlock.type !== newBlock.type && { type: newBlock.type as BlockTypeEnum }), // BlockNote types are already lowercase
        content: embedPropsInContent(newBlock), // Embed props in content for backend storage
    };

    if (Object.keys(changes).length > 0) {
        changesEngine.addChange(newBlock.id, {
            type: 'update',
            blockId: newBlock.id,
            data: changes as Parameters<typeof updateBlockApi>[1],
        });
    }
};

const handleMove = (movedBlock: Block, pageId: string, isParentChanged: boolean, positionIndex: Map<string, BlockPosition> | null) => {
    const posInfo = getPositionForBlock(positionIndex, movedBlock.id, pageId);

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

interface BlockPosition {
    blockId: string;
    beforeBlockId: string | null;
    afterBlockId: string | null;
    parentId: string;
}

/**
 * Single-pass walk of the document tree → id → position info.
 * A paste reports one insert per pasted block; looking each one up with a
 * full tree search is O(paste × doc). Build once per handleChanges call.
 */
export function buildPositionIndex(document: Block[], pageId: string): Map<string, BlockPosition> {
    const index = new Map<string, BlockPosition>();
    const walk = (blocks: Block[], parentId: string) => {
        blocks.forEach((block, i) => {
            index.set(block.id, {
                blockId: block.id,
                beforeBlockId: i > 0 ? blocks[i - 1]!.id : null,
                afterBlockId: i < blocks.length - 1 ? blocks[i + 1]!.id : null,
                parentId,
            });
            if (block.children && block.children.length > 0) {
                walk(block.children, block.id);
            }
        });
    };
    walk(document, pageId);
    return index;
}

/**
 * Position lookup for a block. Prefers the prebuilt per-call index;
 * falls back to building one (kept cheap — single walk either way).
 */
function getPositionForBlock(positionIndex: Map<string, BlockPosition> | null, blockId: string, pageId: string): BlockPosition {
    const hit = positionIndex?.get(blockId);
    if (hit) return hit;
    // Shouldn't normally happen (index covers the whole document) — a block
    // deleted mid-flush is the usual case; anchor it to the page root.
    console.warn(`[Position] Block ${blockId} not in index, defaulting to page root`);
    return { blockId, beforeBlockId: null, afterBlockId: null, parentId: pageId };
}

/**
 * Calculates the position info for a block
 * Works with nested blocks (children of other blocks)
 * Returns the IDs of blocks before and after, plus parent info
 */
export function getBlockPositionInfo(document: Block[], blockId: string, pageId: string) {
    return getPositionForBlock(buildPositionIndex(document, pageId), blockId, pageId);
}
