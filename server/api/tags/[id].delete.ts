import { tags } from '../../db/schema';
import { useDb } from '../../db';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    await requireAuth(event);

    const id = Number(event.context.params?.id);

    if (!id || isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'ID inválido',
        });
    }

    const db = useDb();

    await db.delete(tags).where(eq(tags.id, id));

    return { success: true };
});
