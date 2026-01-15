import { useDb } from '../../db';
import { cashFlows } from '../../db/schema';
import { desc } from 'drizzle-orm';

export default defineEventHandler(async () => {
    const db = useDb();
    const result = await db
        .select()
        .from(cashFlows)
        .orderBy(desc(cashFlows.year), desc(cashFlows.month));

    return result;
});
