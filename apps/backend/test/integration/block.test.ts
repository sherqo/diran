/**
 * Integration tests for block routes
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import type { FastifyInstance } from 'fastify';
import { createTestServer } from '../helpers/server.js';
import { clearDatabase, createTestBlock } from '../helpers/database.js';
import { createAuthenticatedUser, getAuthHeader } from '../helpers/auth.js';

describe('Block Routes', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await createTestServer();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('POST /v1/block', () => {
        test('should create a new block', async () => {
            const { cookies } = await createAuthenticatedUser(app);

            const response = await app.inject({
                method: 'POST',
                url: '/v1/block',
                headers: getAuthHeader(cookies),
                payload: {
                    type: 'PAGE',
                    content: { title: 'My New Page' },
                    order: 'a',
                },
            });

            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.data.id).toBeDefined();
        });

        test('should create a nested block', async () => {
            const { user, cookies } = await createAuthenticatedUser(app);
            const parentBlock = await createTestBlock(user.id);

            const response = await app.inject({
                method: 'POST',
                url: '/v1/block',
                headers: getAuthHeader(cookies),
                payload: {
                    type: 'PARAGRAPH',
                    parentId: parentBlock.id,
                    content: { text: 'This is a paragraph' },
                    order: 'a',
                },
            });

            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
        });

        test('should fail without authentication', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/v1/block',
                payload: {
                    type: 'PAGE',
                    content: { title: 'Test Page' },
                    order: 'a',
                },
            });

            expect(response.statusCode).toBe(401);
        });
    });

    describe('GET /v1/block/:id', () => {
        test('should get block with read permission', async () => {
            const { user, cookies } = await createAuthenticatedUser(app);
            const block = await createTestBlock(user.id);

            const response = await app.inject({
                method: 'GET',
                url: `/v1/block/${block.id}`,
                headers: getAuthHeader(cookies),
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.data.id).toBe(block.id);
        });

        test('should fail without permission', async () => {
            const { user: user1 } = await createAuthenticatedUser(app, {
                email: 'user1@example.com',
            });
            const { cookies: cookies2 } = await createAuthenticatedUser(app, {
                email: 'user2@example.com',
            });

            // Create block owned by user1
            const block = await createTestBlock(user1.id);

            // Try to access with user2
            const response = await app.inject({
                method: 'GET',
                url: `/v1/block/${block.id}`,
                headers: getAuthHeader(cookies2),
            });

            expect(response.statusCode).toBe(403);
        });

        test('should fail without authentication', async () => {
            const { user } = await createAuthenticatedUser(app);
            const block = await createTestBlock(user.id);

            const response = await app.inject({
                method: 'GET',
                url: `/v1/block/${block.id}`,
            });

            expect(response.statusCode).toBe(401);
        });
    });

    describe('PUT /v1/block/:id', () => {
        test('should update block with write permission', async () => {
            const { user, cookies } = await createAuthenticatedUser(app);
            const block = await createTestBlock(user.id);

            const response = await app.inject({
                method: 'PUT',
                url: `/v1/block/${block.id}`,
                headers: getAuthHeader(cookies),
                payload: {
                    content: { title: 'Updated Title' },
                },
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
        });

        test('should fail without write permission', async () => {
            const { user: user1 } = await createAuthenticatedUser(app, {
                email: 'user1@example.com',
            });
            const { cookies: cookies2 } = await createAuthenticatedUser(app, {
                email: 'user2@example.com',
            });

            const block = await createTestBlock(user1.id);

            const response = await app.inject({
                method: 'PUT',
                url: `/v1/block/${block.id}`,
                headers: getAuthHeader(cookies2),
                payload: {
                    content: { title: 'Hacked Title' },
                },
            });

            expect(response.statusCode).toBe(403);
        });

        test('should fail without authentication', async () => {
            const { user } = await createAuthenticatedUser(app);
            const block = await createTestBlock(user.id);

            const response = await app.inject({
                method: 'PUT',
                url: `/v1/block/${block.id}`,
                payload: {
                    content: { title: 'Updated Title' },
                },
            });

            expect(response.statusCode).toBe(401);
        });
    });

    describe('DELETE /v1/block/:id', () => {
        test('should delete block with write permission', async () => {
            const { user, cookies } = await createAuthenticatedUser(app);
            const block = await createTestBlock(user.id);

            const response = await app.inject({
                method: 'DELETE',
                url: `/v1/block/${block.id}`,
                headers: getAuthHeader(cookies),
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
        });

        test('should fail without write permission', async () => {
            const { user: user1 } = await createAuthenticatedUser(app, {
                email: 'user1@example.com',
            });
            const { cookies: cookies2 } = await createAuthenticatedUser(app, {
                email: 'user2@example.com',
            });

            const block = await createTestBlock(user1.id);

            const response = await app.inject({
                method: 'DELETE',
                url: `/v1/block/${block.id}`,
                headers: getAuthHeader(cookies2),
            });

            expect(response.statusCode).toBe(403);
        });

        test('should fail without authentication', async () => {
            const { user } = await createAuthenticatedUser(app);
            const block = await createTestBlock(user.id);

            const response = await app.inject({
                method: 'DELETE',
                url: `/v1/block/${block.id}`,
            });

            expect(response.statusCode).toBe(401);
        });
    });
});
