import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Always reuse a single client per instance via globalThis. On Vercel each
// function instance handles many sequential/concurrent invocations, so
// creating a fresh PrismaClient per request would exhaust the Neon pool.
export const db = globalForPrisma.prisma ?? new PrismaClient();

globalForPrisma.prisma = db;
