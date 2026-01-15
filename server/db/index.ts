import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function useDb() {
    if (!db) {
        const config = useRuntimeConfig();
        const connectionString = config.databaseUrl as string;
        const client = postgres(connectionString);
        db = drizzle(client, { schema });
    }
    return db;
}
