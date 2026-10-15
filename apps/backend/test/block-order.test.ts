import { beforeEach, describe, expect, test } from 'bun:test';
import { randomUUID } from 'crypto';
import { db, resetDb, createUser, createPage, createBlock, childIds } from './helpers.js';
import { updateBlockRecord } from '#features/block/service.js';

const ids = (n: number) => Array.from({ length: n }, () => randomUUID());

describe('block order', () => {
    let user: string;
    let page: string;

    beforeEach(async () => {
        await resetDb();
        user = await createUser();
        page = await createPage(user);
    });

    test('typing blocks one after another keeps them in order', async () => {
        const [a, b, c] = ids(3);
        await createBlock(user, { id: a, parentId: page, prevId: null, nextId: null });
        await createBlock(user, { id: b, parentId: page, prevId: a, nextId: null });
        await createBlock(user, { id: c, parentId: page, prevId: b, nextId: null });

        expect(await childIds(page)).toEqual([a, b, c]);
    });

    // A paste between A and Z arrives as one bulk: each new block's nextId is
    // the next pasted block, which does not exist yet when it is created.
    test('pasting several blocks between two existing blocks', async () => {
        const [a, z, p1, p2, p3] = ids(5);
        await createBlock(user, { id: a, parentId: page, prevId: null, nextId: null });
        await createBlock(user, { id: z, parentId: page, prevId: a, nextId: null });

        await createBlock(user, { id: p1, parentId: page, prevId: a, nextId: p2 });
        await createBlock(user, { id: p2, parentId: page, prevId: p1, nextId: p3 });
        await createBlock(user, { id: p3, parentId: page, prevId: p2, nextId: z });

        expect(await childIds(page)).toEqual([a, p1, p2, p3, z]);
    });

    test('pasting several blocks at the top of a page', async () => {
        const [a, p1, p2] = ids(3);
        await createBlock(user, { id: a, parentId: page, prevId: null, nextId: null });

        await createBlock(user, { id: p1, parentId: page, prevId: null, nextId: p2 });
        await createBlock(user, { id: p2, parentId: page, prevId: p1, nextId: a });

        expect(await childIds(page)).toEqual([p1, p2, a]);
    });

    test('many inserts at the same spot never collide', async () => {
        const [a, z] = ids(2);
        await createBlock(user, { id: a, parentId: page, prevId: null, nextId: null });
        await createBlock(user, { id: z, parentId: page, prevId: a, nextId: null });

        // Each insert goes right after A, pushing the previous ones down.
        const inserted = ids(30);
        for (const id of inserted) {
            await createBlock(user, { id, parentId: page, prevId: a, nextId: null });
        }

        expect(await childIds(page)).toEqual([a, ...inserted.reverse(), z]);
    });

    test('moving a block within the same parent', async () => {
        const [a, b, c] = ids(3);
        await createBlock(user, { id: a, parentId: page, prevId: null, nextId: null });
        await createBlock(user, { id: b, parentId: page, prevId: a, nextId: null });
        await createBlock(user, { id: c, parentId: page, prevId: b, nextId: null });

        // Drag C between A and B.
        await db.$transaction(tx => updateBlockRecord(tx, user, c, { prevId: a, nextId: b }));
        expect(await childIds(page)).toEqual([a, c, b]);

        // Drag A to the end.
        await db.$transaction(tx => updateBlockRecord(tx, user, a, { prevId: b, nextId: null }));
        expect(await childIds(page)).toEqual([c, b, a]);
    });

    test('moving a block to a new parent places it among the new siblings', async () => {
        const [list, child1, child2, other] = ids(4);
        await createBlock(user, { id: list, parentId: page, prevId: null, nextId: null });
        await createBlock(user, { id: other, parentId: page, prevId: list, nextId: null });
        await createBlock(user, { id: child1, parentId: list, prevId: null, nextId: null });
        await createBlock(user, { id: child2, parentId: list, prevId: child1, nextId: null });

        // Indent `other` under `list`, between its two children.
        await db.$transaction(tx => updateBlockRecord(tx, user, other, { parentId: list, prevId: child1, nextId: child2 }));

        expect(await childIds(list)).toEqual([child1, other, child2]);
        expect(await childIds(page)).toEqual([list]);
    });
});
