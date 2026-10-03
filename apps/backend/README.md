# Diran AI Backend

Fastify + TypeScript + PostgreSQL (Prisma) API. Deployed Vercel-only as serverless functions (`diran-backend.vercel.app`).

## Stack

- **Fastify 5** + `fastify-type-provider-zod`, `@fastify/cors|helmet|cookie|rate-limit`
- **Prisma 6** + Postgres (`gen_random_uuid()`), JWT (`jsonwebtoken` + `bcryptjs`)
- **Resend** (email OTP), **Cloudflare R2** (S3 uploads), **Gemini** (AI)
- Runtime: `bun`, ESM (`#*` subpath imports with `.js` extensions)

## Local dev

```bash
cp .env.example .env   # edit DATABASE_URL, JWT_SECRET, RESEND/R2/GEMINI keys
bun install
bunx prisma migrate dev
bun run dev            # bun --watch src/server.ts, listens on $PORT (default 3000)
```

Point the frontend at it:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

Health checks (no DB needed for `/ping` and `/`):

```bash
curl http://localhost:3000/ping
curl http://localhost:3000/
curl http://localhost:3000/v1/health
```

## Routes (`/v1` prefix, see `API.md`)

- `POST /v1/auth/*` — signup, login, refresh, logout, forgot/reset-password, verify-email, resend-otp
- `GET|PATCH /v1/user/profile`, `POST /v1/user/profile/photo`, `POST /v1/user/change-password`
- `/v1/team/*`, `/v1/block/*` (incl. `POST /v1/block/bulk` — up to 500 ordered ops per sync flush, per-op results), `/v1/page/*`, `POST /v1/ai`, `POST /v1/extras/waitlist`, `GET /v1/health`

Realtime collab (`/v1/ws/collab`) is **removed** on serverless — history only (`bea91c9^`). Frontend gates it behind `NEXT_PUBLIC_COLLAB_ENABLED` (default off).

## Env

See `.env.example`: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` (single or comma-separated), `PORT` (default 3000), `RESEND_API_KEY`, `EMAIL_DOMAIN`, `R2_ACCOUNT_ID|ACCESS_KEY_ID|SECRET_ACCESS_KEY|BUCKET_NAME|PUBLIC_URL`, `GEMINI_API_KEY`.
Local dev loads `.env` via `dotenv` (skipped when `VERCEL=1`); on Vercel set vars in the dashboard.

## Scripts

```bash
bun run dev            # watch mode
bun run build          # tsc + tsc-alias
bun run vercel-build   # shared build + prisma generate + build + vendor deps
bun run start          # bun run dist/server.js
bun run migrate        # prisma migrate dev
bun run generate       # prisma generate
bun run studio         # prisma studio
```

## Vercel notes

- Entrypoint `src/server.ts` keeps Vercel Fastify detection shape: instance named `fastify`, sync route registration, bare top-level `fastify.listen()`. Do not wrap it in try/catch, conditionals, or top-level await.
- Resend/R2 clients are lazy-init so missing keys return 500s instead of crashing every route (`FUNCTION_INVOCATION_FAILED`).
- `vercel.json` + `vendor-vercel-deps` vendor `@diran/shared/dist` and Prisma client for `Root Directory = apps/backend`.
