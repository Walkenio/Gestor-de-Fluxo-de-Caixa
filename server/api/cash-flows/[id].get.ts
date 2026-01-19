import { useDb } from '../../db';
import { cashFlows, entries, expenses, entryTags, expenseTags, tags } from '../../db/schema';
import { eq, asc, inArray } from 'drizzle-orm';
import { calculateCashFlowSummary } from '../../services/cashFlowService';

export default defineEventHandler(async (event) => {
    await requireAuth(event);

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

    // Buscar entries
    const entriesList = await db
        .select()
        .from(entries)
        .where(eq(entries.cashFlowId, id))
        .orderBy(asc(entries.date));

    // Buscar tags de cada entry
    const entryIds = entriesList.map((e) => e.id);
    let entriesWithTags = entriesList.map((e) => ({ ...e, tags: [] as typeof tags.$inferSelect[] }));

    if (entryIds.length > 0) {
        const entryTagsResult = await db
            .select({
                entryId: entryTags.entryId,
                tag: tags,
            })
            .from(entryTags)
            .innerJoin(tags, eq(entryTags.tagId, tags.id))
            .where(inArray(entryTags.entryId, entryIds));

        entriesWithTags = entriesList.map((entry) => ({
            ...entry,
            tags: entryTagsResult
                .filter((et) => et.entryId === entry.id)
                .map((et) => et.tag),
        }));
    }

    // Buscar expenses
    const expensesList = await db
        .select()
        .from(expenses)
        .where(eq(expenses.cashFlowId, id))
        .orderBy(asc(expenses.date));

    // Buscar tags de cada expense
    const expenseIds = expensesList.map((e) => e.id);
    let expensesWithTags = expensesList.map((e) => ({ ...e, tags: [] as typeof tags.$inferSelect[] }));

    if (expenseIds.length > 0) {
        const expenseTagsResult = await db
            .select({
                expenseId: expenseTags.expenseId,
                tag: tags,
            })
            .from(expenseTags)
            .innerJoin(tags, eq(expenseTags.tagId, tags.id))
            .where(inArray(expenseTags.expenseId, expenseIds));

        expensesWithTags = expensesList.map((expense) => ({
            ...expense,
            tags: expenseTagsResult
                .filter((et) => et.expenseId === expense.id)
                .map((et) => et.tag),
        }));
    }

    const summary = await calculateCashFlowSummary(id);

    return {
        ...cashFlow,
        entries: entriesWithTags,
        expenses: expensesWithTags,
        summary,
    };
});
