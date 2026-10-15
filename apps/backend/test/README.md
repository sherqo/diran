# Backend tests

Integration tests that run the real services against a throwaway Postgres.
They **truncate every table**, so `test/setup.ts` refuses any host that is not
`localhost` / `127.0.0.1`. Never point `TEST_DATABASE_URL` at Neon.

## Run

Any local Postgres works. Without Docker, PGlite (Postgres in WASM, ~10 MB) is enough:

```sh
# terminal 1: in-memory Postgres on port 54329
npx -y @electric-sql/pglite-socket -p 54329 -m 10

# terminal 2: create the tables, then run the tests (from apps/backend)
URL="postgresql://postgres:postgres@127.0.0.1:54329/postgres?sslmode=disable"
DATABASE_URL=$URL DATABASE_DIRECT_URL=$URL bunx prisma db push --skip-generate
TEST_DATABASE_URL="$URL&connection_limit=5&pgbouncer=true" bun test
```

`pgbouncer=true` is only needed for PGlite: all its connections share one
session, so Prisma must not use named prepared statements.
