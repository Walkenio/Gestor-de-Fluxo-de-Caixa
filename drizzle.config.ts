import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './server/db/schema.ts',
    out: './server/db/migrations',
    dialect: 'postgresql',

    // MUITO IMPORTANTE
    strict: true,

    // evita diffs falsos por ordenação
    verbose: true,

    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
