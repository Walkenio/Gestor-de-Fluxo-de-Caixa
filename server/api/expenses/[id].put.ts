import { useDb } from '../../db';
import { expenses } from '../../db/schema';
import { eq } from 'drizzle-orm';

interface UpdateExpenseBody {
    date?: string;
    description?: string;
    amount?: string;
}

export default defineEventHandler(async (event) => {
    const db = useDb();
    const id = parseInt(getRouterParam(event, 'id') || '');
    const body = await readBody<UpdateExpenseBody>(event);

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

    const [updated] = await db
        .update(expenses)
        .set({
            date: body.date ?? existing.date,
            description: body.description ?? existing.description,
            amount: body.amount ?? existing.amount,
        })
        .where(eq(expenses.id, id))
        .returning();

    return updated;
});
