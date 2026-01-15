import { useDb } from '../../db';
import { cashFlows, entries, expenses } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import { calculateCashFlowSummary } from '../../services/cashFlowService';

export default defineEventHandler(async (event) => {
    const db = useDb();
    const id = parseInt(getRouterParam(event, 'id') || '');

    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'ID inválido',
        });
    }

    const cashFlow = await db.query.cashFlows.findFirst({
        where: eq(cashFlows.id, id),
    });

    if (!cashFlow) {
        throw createError({
            statusCode: 404,
            message: 'Fluxo de caixa não encontrado',
        });
    }

    const entriesList = await db
        .select()
        .from(entries)
        .where(eq(entries.cashFlowId, id))
        .orderBy(asc(entries.date));

    const expensesList = await db
        .select()
        .from(expenses)
        .where(eq(expenses.cashFlowId, id))
        .orderBy(asc(expenses.date));

    const summary = await calculateCashFlowSummary(id);

    return {
        ...cashFlow,
        entries: entriesList,
        expenses: expensesList,
        summary,
    };
});
