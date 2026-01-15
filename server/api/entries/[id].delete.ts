import { useDb } from '../../db';
import { entries } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const db = useDb();
    const id = parseInt(getRouterParam(event, 'id') || '');

    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'ID inválido',
        });
    }

    const existing = await db.query.entries.findFirst({
        where: eq(entries.id, id),
    });

    if (!existing) {
        throw createError({
            statusCode: 404,
            message: 'Entrada não encontrada',
        });
    }

    await db.delete(entries).where(eq(entries.id, id));

    return { success: true, message: 'Entrada removida com sucesso' };
});
