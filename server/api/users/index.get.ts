import { useDb } from '../../db';
import { users } from '../../db/schema';
import { desc } from 'drizzle-orm';
import { requireAuth } from '../../utils/session';

export default defineEventHandler(async (event) => {
    requireAuth(event);

    const db = useDb();
    const result = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            isAdmin: users.isAdmin,
            createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt));

    return result;
});
