import { useDb } from '../../db';
import { entries, cashFlows, entryTags } from '../../db/schema';
import { eq } from 'drizzle-orm';

interface CreateEntryBody {
    cashFlowId: number;
    date: string;
    description: string;
    amountExpected?: string;
    amountReceived?: string;
    tagIds?: number[];
}

export default defineEventHandler(async (event) => {
    await requireAuth(event);

    const db = useDb();
    const body = await readBody<CreateEntryBody>(event);

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

    const [newEntry] = await db
        .insert(entries)
        .values({
            cashFlowId: body.cashFlowId,
            date: body.date,
            description: body.description,
            amountExpected: body.amountExpected || '0',
            amountReceived: body.amountReceived || '0',
        })
        .returning();

    // Inserir tags se fornecidas
    if (body.tagIds && body.tagIds.length > 0) {
        await db.insert(entryTags).values(
            body.tagIds.map((tagId) => ({
                entryId: newEntry.id,
                tagId,
            }))
        );
    }

    return newEntry;
});
