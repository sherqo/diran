# Diran backend — Vercel follow-up plan (saved 2026-09-16)

## Status: backend live on Vercel (`diran-backend.vercel.app`)

## 1. Gate frontend collaboration (default off) — user approved
- `apps/frontend/src/lib/collaboration/useCollaboration.ts`: early-return static
  `disconnected` state unless `NEXT_PUBLIC_COLLAB_ENABLED === 'true'`.
- Route any other direct socket usage through the same flag.
- Validate with frontend `next build` / typecheck.

## 2. Retire Railway backend — user approved (Vercel only)
- Delete `diran/railway.json`.
- Remove `@railway/cli` from `apps/backend/package.json`, re-sync `bun.lock`.

## 3. Tidy local dev + stale docs — user approved
- Re-add `dotenv.config()` in `apps/backend/src/server.ts` guarded by
  `process.env.VERCEL !== '1'` (import-time side effect only, safe for detection).
- Document backend local port 3000 + `NEXT_PUBLIC_API_URL` override in README.
- Remove `/ws/collab` from `apps/backend/API.md`; remove `ENABLE_*` block from
  `apps/backend/.env.example`; note collab lives in git history (`bea91c9^`).
- Delete unused `src/lib/middleware/logger.ts` after confirming no importers.

## 4. Import conventions (user request)
- Backend same-package imports migrated `./`+`../` → `#` subpath imports
  (Node `imports` field), KEEPING `.js` extensions (required by Node ESM runtime).
- `@diran/shared` cross-package alias unchanged. Frontend `@/` unchanged.

## Verification checklist
1. `bun run vercel-build` green in `apps/backend`.
2. Boot `dist/server.js`, curl `/ping`, `/`, `/v1/health`.
3. Isolated copy + `vercel dev --local` with zero env → 200s, no errors.
4. Frontend build passes with flag off.
5. Commit + push `main`, watch Vercel build, curl production.
