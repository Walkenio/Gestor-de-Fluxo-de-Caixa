import { useDb } from '../../db';
import { entries, entryTags } from '../../db/schema';
import { eq } from 'drizzle-orm';

interface UpdateEntryBody {
    date?: string;
    description?: string;
    amountExpected?: string;
    amountReceived?: string;
    tagIds?: number[];
}

export default defineEventHandler(async (event) => {
    await requireAuth(event);

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

    // Atualizar tags se fornecidas
    if (body.tagIds !== undefined) {
        // Remover tags antigas
        await db.delete(entryTags).where(eq(entryTags.entryId, id));

        // Inserir novas tags
        if (body.tagIds.length > 0) {
            await db.insert(entryTags).values(
                body.tagIds.map((tagId) => ({
                    entryId: id,
                    tagId,
                }))
            );
        }
    }

    return updated;
});
