/**
 * Authentication helpers for tests
 */

import { FastifyInstance } from 'fastify';
import type { User } from '@prisma/client';
import { createTestUser, getCookies } from './database.js';

/**
 * Create a user and log them in, returning cookies
 */
export async function createAuthenticatedUser(
    app: FastifyInstance,
    userData?: Partial<User>
): Promise<{ user: User; cookies: Record<string, string> }> {
    const user = await createTestUser(userData);

    const response = await app.inject({
        method: 'POST',
        url: '/v1/auth/login',
        payload: {
            email: user.email,
            password: userData?.password || 'Test123!@#',
        },
    });

    const cookies = getCookies(response.headers);

    return { user, cookies };
}

/**
 * Get auth cookies header string from user
 */
export function getAuthHeader(cookies: Record<string, string>): Record<string, string> {
    const cookieString = Object.entries(cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');

    return {
        cookie: cookieString,
    };
}
