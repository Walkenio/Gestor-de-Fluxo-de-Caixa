import { useDb } from '../../db';
import { expenses, cashFlows, expenseTags } from '../../db/schema';
import { eq } from 'drizzle-orm';

interface CreateExpenseBody {
    cashFlowId: number;
    date: string;
    description: string;
    amount?: string;
    tagIds?: number[];
}

export default defineEventHandler(async (event) => {
    await requireAuth(event);

    const db = useDb();
    const body = await readBody<CreateExpenseBody>(event);

    if (!body.cashFlowId || !body.date || !body.description) {
        throw createError({
            statusCode: 400,
            message: 'cashFlowId, date e description são obrigatórios',
        });
    }

    const cashFlow = await db.query.cashFlows.findFirst({
        where: eq(cashFlows.id, body.cashFlowId),
    });

    if (!cashFlow) {
        throw createError({
            statusCode: 404,
            message: 'Fluxo de caixa não encontrado',
        });
    }

    const [newExpense] = await db
        .insert(expenses)
        .values({
            cashFlowId: body.cashFlowId,
            date: body.date,
            description: body.description,
            amount: body.amount || '0',
        })
        .returning();

    // Inserir tags se fornecidas
    if (body.tagIds && body.tagIds.length > 0) {
        await db.insert(expenseTags).values(
            body.tagIds.map((tagId) => ({
                expenseId: newExpense.id,
                tagId,
            }))
        );
    }

    return newExpense;
});
