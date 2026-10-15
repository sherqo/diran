// Preloaded by `bun test` (see bunfig.toml) before any test imports the db.
// Bun auto-loads .env, which points at the real database — never use it here.
const url = process.env.TEST_DATABASE_URL;

if (!url) {
    throw new Error('Set TEST_DATABASE_URL to a disposable local Postgres (see test/README.md)');
}

const host = new URL(url).hostname;
if (host !== 'localhost' && host !== '127.0.0.1') {
    throw new Error(`Refusing to run tests against non-local database host "${host}"`);
}

process.env.DATABASE_URL = url;
process.env.JWT_SECRET ??= 'test-secret';
