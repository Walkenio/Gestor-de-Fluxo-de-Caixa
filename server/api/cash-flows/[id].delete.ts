import { useDb } from '../../db';
import { cashFlows } from '../../db/schema';
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

    const existing = await db.query.cashFlows.findFirst({
        where: eq(cashFlows.id, id),
    });

    if (!existing) {
        throw createError({
            statusCode: 404,
            message: 'Fluxo de caixa não encontrado',
        });
    }

    await db.delete(cashFlows).where(eq(cashFlows.id, id));

    return { success: true, message: 'Fluxo de caixa removido com sucesso' };
});
