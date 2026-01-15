import { useDb } from '../../db';
import { cashFlows } from '../../db/schema';
import { eq } from 'drizzle-orm';

interface UpdateCashFlowBody {
    initialBalance?: string;
}

export default defineEventHandler(async (event) => {
    const db = useDb();
    const id = parseInt(getRouterParam(event, 'id') || '');
    const body = await readBody<UpdateCashFlowBody>(event);

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

    const [updated] = await db
        .update(cashFlows)
        .set({
            initialBalance: body.initialBalance ?? existing.initialBalance,
        })
        .where(eq(cashFlows.id, id))
        .returning();

    return updated;
});
