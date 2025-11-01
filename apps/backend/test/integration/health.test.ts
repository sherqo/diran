/**
 * Integration test for health check
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import type { FastifyInstance } from 'fastify';
import { createTestServer } from '../helpers/server.js';

describe('Health Routes', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await createTestServer();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /v1/health', () => {
        test('should return health status', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/v1/health',
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.status).toBe('ok');
        });
    });
});
