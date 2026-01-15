import { useDb } from '../../db';
import { expenses } from '../../db/schema';
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

    const existing = await db.query.expenses.findFirst({
        where: eq(expenses.id, id),
    });

    if (!existing) {
        throw createError({
            statusCode: 404,
            message: 'Saída não encontrada',
        });
    }

    await db.delete(expenses).where(eq(expenses.id, id));

    return { success: true, message: 'Saída removida com sucesso' };
});
