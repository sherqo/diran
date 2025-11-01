/**
 * Database helpers for tests
 */

import { db } from '#lib/database/connection';
import type { User, Block } from '@prisma/client';

/**
 * Clear all data from test database
 */
export async function clearDatabase() {
    // Order matters due to foreign keys
    await db.permission.deleteMany();
    await db.block.deleteMany();
    await db.user.deleteMany();
}

/**
 * Create a test user
 */
export async function createTestUser(data?: Partial<User>): Promise<User> {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(data?.password || 'Test123!@#', 10);

    return db.user.create({
        data: {
            email: data?.email || `test-${Date.now()}@example.com`,
            password: hashedPassword,
            name: data?.name || 'Test User',
            emailVerified: data?.emailVerified ?? true,
            photo: data?.photo,
        },
    });
}

/**
 * Create a test block
 */
export async function createTestBlock(userId: string, data?: Partial<Block>): Promise<Block> {
    const block = await db.block.create({
        data: {
            type: data?.type || 'PAGE',
            parentId: data?.parentId || null,
            order: data?.order || 'a',
            content: data?.content || { title: 'Test Page' },
        },
    });

    // Create owner permission for the user
    await db.permission.create({
        data: {
            actorId: userId,
            actorType: 'USER',
            entityId: block.id,
            entityType: 'BLOCK',
            role: 'OWNER',
        },
    });

    return block;
}

/**
 * Get all cookies from response headers
 */
export function getCookies(headers: any): Record<string, string> {
    const setCookie = headers['set-cookie'];
    if (!setCookie) return {};

    const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
    const cookies: Record<string, string> = {};

    for (const cookie of cookieArray) {
        const [nameValue] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        if (name && value) {
            cookies[name.trim()] = value.trim();
        }
    }

    return cookies;
}

/**
 * Create cookie header string from cookies object
 */
export function cookieHeader(cookies: Record<string, string>): string {
    return Object.entries(cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
}
