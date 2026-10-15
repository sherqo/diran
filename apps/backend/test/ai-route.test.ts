import { beforeAll, describe, expect, test } from 'bun:test';
import { randomUUID } from 'crypto';
import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import { registerAiRoutes } from '#features/ai/router.js';
import { errorHandler } from '#lib/middleware/errorHandler.js';
import { generateAccessToken } from '#lib/utils/auth.js';

// Never reach the real Gemini API from tests: without a key the service
// answers 503, which also proves the request got past auth and validation.
delete process.env.GEMINI_API_KEY;

const app = Fastify();
app.register(fastifyCookie);
app.setErrorHandler(errorHandler);
app.register(registerAiRoutes, { prefix: '/ai' });

const loggedIn = { accessToken: generateAccessToken({ id: randomUUID() }) };
const block = { id: 'b1', type: 'paragraph', content: [] };

const askAi = (payload: object, cookies?: Record<string, string>) =>
    app.inject({ method: 'POST', url: '/ai', payload, ...(cookies && { cookies }) });

describe('POST /ai', () => {
    beforeAll(() => app.ready());

    test('rejects anonymous requests', async () => {
        const res = await askAi({ prompt: 'hi' });
        expect(res.statusCode).toBe(401);
    });

    test('lets a logged-in user through', async () => {
        const res = await askAi({ prompt: 'hi', documentContext: [block, block, block] }, loggedIn);
        expect(res.statusCode).toBe(503);
    });

    test('rejects too many context blocks', async () => {
        const res = await askAi({ prompt: 'hi', documentContext: Array(11).fill(block) }, loggedIn);
        expect(res.statusCode).toBe(400);
    });

    test('rejects a body over 100 KB', async () => {
        const res = await askAi({ prompt: 'hi', currentBlock: { ...block, content: 'x'.repeat(101 * 1024) } }, loggedIn);
        expect(res.statusCode).toBe(413);
    });
});
