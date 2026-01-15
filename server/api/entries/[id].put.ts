import { useDb } from '../../db';
import { entries } from '../../db/schema';
import { eq } from 'drizzle-orm';

interface UpdateEntryBody {
    date?: string;
    description?: string;
    amountExpected?: string;
    amountReceived?: string;
}

export default defineEventHandler(async (event) => {
    const db = useDb();
    const id = parseInt(getRouterParam(event, 'id') || '');
    const body = await readBody<UpdateEntryBody>(event);

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

    const [updated] = await db
        .update(entries)
        .set({
            date: body.date ?? existing.date,
            description: body.description ?? existing.description,
            amountExpected: body.amountExpected ?? existing.amountExpected,
            amountReceived: body.amountReceived ?? existing.amountReceived,
        })
        .where(eq(entries.id, id))
        .returning();

    return updated;
});
