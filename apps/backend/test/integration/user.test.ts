/**
 * Integration tests for user routes
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import type { FastifyInstance } from 'fastify';
import { createTestServer } from '../helpers/server.js';
import { clearDatabase } from '../helpers/database.js';
import { createAuthenticatedUser, getAuthHeader } from '../helpers/auth.js';

describe('User Routes', () => {
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

    describe('GET /v1/user/profile', () => {
        test('should get user profile when authenticated', async () => {
            const { user, cookies } = await createAuthenticatedUser(app);

            const response = await app.inject({
                method: 'GET',
                url: '/v1/user/profile',
                headers: getAuthHeader(cookies),
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.data.user.email).toBe(user.email);
            expect(body.data.name).toBe(user.name);
            expect(body.data.password).toBeUndefined(); // Password should not be returned
        });

        test('should fail without authentication', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/v1/user/profile',
            });

            expect(response.statusCode).toBe(401);
        });
    });

    describe('PATCH /v1/user/profile', () => {
        test('should update user profile', async () => {
            const { cookies } = await createAuthenticatedUser(app);

            const response = await app.inject({
                method: 'PATCH',
                url: '/v1/user/profile',
                headers: getAuthHeader(cookies),
                payload: {
                    name: 'Updated Name',
                },
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
        });

        test('should fail to update email to existing one', async () => {
            const { cookies } = await createAuthenticatedUser(app, {
                email: 'user1@example.com',
            });

            // Create another user
            await createAuthenticatedUser(app, {
                email: 'user2@example.com',
            });

            const response = await app.inject({
                method: 'PATCH',
                url: '/v1/user/profile',
                headers: getAuthHeader(cookies),
                payload: {
                    email: 'user2@example.com', // Try to use existing email
                },
            });

            expect(response.statusCode).toBe(400);
        });

        test('should fail without authentication', async () => {
            const response = await app.inject({
                method: 'PATCH',
                url: '/v1/user/profile',
                payload: {
                    name: 'Updated Name',
                },
            });

            expect(response.statusCode).toBe(401);
        });
    });

    describe('POST /v1/user/change-password', () => {
        test('should change password with correct old password', async () => {
            const { cookies } = await createAuthenticatedUser(app, {
                password: 'OldPassword123!',
            });

            const response = await app.inject({
                method: 'POST',
                url: '/v1/user/change-password',
                headers: getAuthHeader(cookies),
                payload: {
                    currentPassword: 'OldPassword123!',
                    newPassword: 'NewPassword123!',
                },
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
        });

        test('should fail with incorrect old password', async () => {
            const { cookies } = await createAuthenticatedUser(app, {
                password: 'OldPassword123!',
            });

            const response = await app.inject({
                method: 'POST',
                url: '/v1/user/change-password',
                headers: getAuthHeader(cookies),
                payload: {
                    currentPassword: 'WrongPassword123!',
                    newPassword: 'NewPassword123!',
                },
            });

            expect(response.statusCode).toBe(400);
        });

        test('should fail without authentication', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/v1/user/change-password',
                payload: {
                    currentPassword: 'OldPassword123!',
                    newPassword: 'NewPassword123!',
                },
            });

            expect(response.statusCode).toBe(401);
        });
    });
});
