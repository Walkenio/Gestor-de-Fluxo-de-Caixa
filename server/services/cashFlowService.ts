import { useDb } from '../db';
import { cashFlows, entries, expenses } from '../db/schema';
import { eq, sum } from 'drizzle-orm';

export interface CashFlowSummary {
    initialBalance: number;
    totalEntries: number;
    totalExpenses: number;
    finalBalance: number;
}

export async function calculateCashFlowSummary(
    cashFlowId: number
): Promise<CashFlowSummary> {
    const db = useDb();

    const cashFlow = await db.query.cashFlows.findFirst({
        where: eq(cashFlows.id, cashFlowId),
    });

    if (!cashFlow) {
        throw createError({
            statusCode: 404,
            message: 'Fluxo de caixa não encontrado',
        });
    }

    const [entriesSum] = await db
        .select({ total: sum(entries.amountReceived) })
        .from(entries)
        .where(eq(entries.cashFlowId, cashFlowId));

    const [expensesSum] = await db
        .select({ total: sum(expenses.amount) })
        .from(expenses)
        .where(eq(expenses.cashFlowId, cashFlowId));

    const initialBalance = parseFloat(cashFlow.initialBalance);
    const totalEntries = parseFloat(entriesSum.total || '0');
    const totalExpenses = parseFloat(expensesSum.total || '0');
    const finalBalance = initialBalance + totalEntries - totalExpenses;

    return {
        initialBalance,
        totalEntries,
        totalExpenses,
        finalBalance,
    };
}
