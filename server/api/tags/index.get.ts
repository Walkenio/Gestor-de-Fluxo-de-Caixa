import { tags } from '../../db/schema';
import { useDb } from '../../db';
import { asc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    await requireAuth(event);

    const db = useDb();
    const allTags = await db.select().from(tags).orderBy(asc(tags.name));

    return allTags;
});
