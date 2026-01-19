import { tags } from '../../db/schema';
import { useDb } from '../../db';

export default defineEventHandler(async (event) => {
    await requireAuth(event);

    const body = await readBody(event);

    if (!body.name || typeof body.name !== 'string') {
        throw createError({
            statusCode: 400,
            message: 'Nome da tag é obrigatório',
        });
    }

    const db = useDb();

    const [newTag] = await db
        .insert(tags)
        .values({
            name: body.name.trim(),
            color: body.color || '#6366f1',
        })
        .returning();

    return newTag;
});
