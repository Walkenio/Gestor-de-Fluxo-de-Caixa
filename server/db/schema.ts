import {
    pgTable,
    serial,
    integer,
    varchar,
    decimal,
    date,
    timestamp,
    unique,
    boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabela de Usuários
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    isAdmin: boolean('is_admin').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const cashFlows = pgTable(
    'cash_flows',
    {
        id: serial('id').primaryKey(),
        month: integer('month').notNull(),
        year: integer('year').notNull(),
        initialBalance: decimal('initial_balance', {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default('0'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [unique('unique_month_year').on(table.month, table.year)]
);

export const entries = pgTable('entries', {
    id: serial('id').primaryKey(),
    cashFlowId: integer('cash_flow_id')
        .references(() => cashFlows.id, { onDelete: 'cascade' })
        .notNull(),
    date: date('date').notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    amountExpected: decimal('amount_expected', { precision: 15, scale: 2 })
        .notNull()
        .default('0'),
    amountReceived: decimal('amount_received', { precision: 15, scale: 2 })
        .notNull()
        .default('0'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const expenses = pgTable('expenses', {
    id: serial('id').primaryKey(),
    cashFlowId: integer('cash_flow_id')
        .references(() => cashFlows.id, { onDelete: 'cascade' })
        .notNull(),
    date: date('date').notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    amount: decimal('amount', { precision: 15, scale: 2 })
        .notNull()
        .default('0'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relacionamentos
export const cashFlowsRelations = relations(cashFlows, ({ many }) => ({
    entries: many(entries),
    expenses: many(expenses),
}));

export const entriesRelations = relations(entries, ({ one }) => ({
    cashFlow: one(cashFlows, {
        fields: [entries.cashFlowId],
        references: [cashFlows.id],
    }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
    cashFlow: one(cashFlows, {
        fields: [expenses.cashFlowId],
        references: [cashFlows.id],
    }),
}));

// Types
export type CashFlow = typeof cashFlows.$inferSelect;
export type NewCashFlow = typeof cashFlows.$inferInsert;
export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
