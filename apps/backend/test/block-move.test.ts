import { beforeEach, describe, expect, test } from 'bun:test';
import { randomUUID } from 'crypto';
import { RoleType } from '@prisma/client';
import { db, resetDb, createUser, createPage, createBlock, share } from './helpers.js';
import { updateBlockRecord, deleteBlockRecord } from '#features/block/service.js';
import { getRoleWithInheritance } from '#lib/services/permission.js';

const move = (userId: string, blockId: string, parentId: string | null) =>
    db.$transaction(tx => updateBlockRecord(tx, userId, blockId, { parentId, prevId: null, nextId: null }));

describe('moving blocks to a new parent', () => {
    let owner: string;
    let page: string;
    let parent: string;
    let child: string;

    beforeEach(async () => {
        await resetDb();
        owner = await createUser();
        page = await createPage(owner);
        parent = randomUUID();
        child = randomUUID();
        await createBlock(owner, { id: parent, parentId: page });
        await createBlock(owner, { id: child, parentId: parent });
    });

    test('cannot move a block into itself', async () => {
        await expect(move(owner, parent, parent)).rejects.toThrow('inside itself');
    });

    test('cannot move a block into one of its own children', async () => {
        await expect(move(owner, parent, child)).rejects.toThrow('inside itself');
        await expect(move(owner, page, child)).rejects.toThrow('inside itself');
    });

    test('cannot move a block under a parent that does not exist', async () => {
        await expect(move(owner, child, randomUUID())).rejects.toThrow('not found');
    });

    test('moving within the same page works for an editor', async () => {
        const editor = await createUser();
        await share(editor, page, RoleType.EDITOR);

        await move(editor, child, page);
        const moved = await db.block.findUnique({ where: { id: child } });
        expect(moved?.parentId).toBe(page);
    });

    test('an editor cannot move a block into a page they own', async () => {
        const editor = await createUser();
        await share(editor, page, RoleType.EDITOR);
        const editorPage = await createPage(editor);

        await expect(move(editor, parent, editorPage)).rejects.toThrow('owner');
        expect(await getRoleWithInheritance(owner, parent)).toBe(RoleType.OWNER);
    });

    test('the owner can move a block into another page they can write to', async () => {
        const otherPage = await createPage(owner);

        await move(owner, parent, otherPage);
        const moved = await db.block.findUnique({ where: { id: parent } });
        expect(moved?.parentId).toBe(otherPage);
    });

    test('an editor cannot move a block to the top level', async () => {
        const editor = await createUser();
        await share(editor, page, RoleType.EDITOR);

        await expect(move(editor, parent, null)).rejects.toThrow('owner');
    });

    test('a block the owner moves to the top level stays theirs', async () => {
        await move(owner, parent, null);

        expect(await getRoleWithInheritance(owner, parent)).toBe(RoleType.OWNER);
        expect(await getRoleWithInheritance(owner, child)).toBe(RoleType.OWNER);
    });
});

// Rows written before the cycle check existed may already form a loop.
describe('existing cycles in the data', () => {
    test('permission lookup and delete still finish', async () => {
        await resetDb();
        const owner = await createUser();
        const page = await createPage(owner);
        const a = randomUUID();
        const b = randomUUID();
        await createBlock(owner, { id: a, parentId: page });
        await createBlock(owner, { id: b, parentId: a });
        await db.block.update({ where: { id: a }, data: { parentId: b } }); // a <-> b

        expect(await getRoleWithInheritance(owner, a)).toBeUndefined();

        await db.$transaction(tx => deleteBlockRecord(tx, a));
        expect(await db.block.count({ where: { id: { in: [a, b] } } })).toBe(0);
    });
});
