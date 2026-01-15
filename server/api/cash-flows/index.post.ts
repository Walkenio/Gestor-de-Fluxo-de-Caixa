import { useDb } from '../../db';
import { cashFlows } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

interface CreateCashFlowBody {
    month: number;
    year: number;
    initialBalance?: string;
}

export default defineEventHandler(async (event) => {
    const db = useDb();
    const body = await readBody<CreateCashFlowBody>(event);

    if (!body.month || !body.year) {
        throw createError({
            statusCode: 400,
            message: 'Mês e ano são obrigatórios',
        });
    }

    if (body.month < 1 || body.month > 12) {
        throw createError({
            statusCode: 400,
            message: 'Mês deve estar entre 1 e 12',
        });
    }

    const existing = await db
        .select()
        .from(cashFlows)
        .where(
            and(eq(cashFlows.month, body.month), eq(cashFlows.year, body.year))
        );

    if (existing.length > 0) {
        throw createError({
            statusCode: 409,
            message: 'Já existe um fluxo de caixa para este mês/ano',
        });
    }

    const [newCashFlow] = await db
        .insert(cashFlows)
        .values({
            month: body.month,
            year: body.year,
            initialBalance: body.initialBalance || '0',
        })
        .returning();

    return newCashFlow;
});
