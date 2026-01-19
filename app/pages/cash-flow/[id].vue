<script setup lang="ts">
const { user, logout } = useAuth();

interface Entry {
    id: number;
    cashFlowId: number;
    date: string;
    description: string;
    amountExpected: string;
    amountReceived: string;
}

interface Expense {
    id: number;
    cashFlowId: number;
    date: string;
    description: string;
    amount: string;
}

interface CashFlowSummary {
    initialBalance: number;
    totalEntries: number;
    totalExpenses: number;
    finalBalance: number;
}

interface CashFlowDetail {
    id: number;
    month: number;
    year: number;
    initialBalance: string;
    entries: Entry[];
    expenses: Expense[];
    summary: CashFlowSummary;
}

const route = useRoute();
const id = route.params.id;

const {
    data: cashFlow,
    refresh,
    error,
} = await useFetch<CashFlowDetail>(`/api/cash-flows/${id}`);

const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatMonth(month: number): string {
    return monthNames[month - 1];
}

function formatCurrency(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

const showEntryModal = ref(false);
const showExpenseModal = ref(false);
const editingEntry = ref<Entry | null>(null);
const editingExpense = ref<Expense | null>(null);
const isSubmitting = ref(false);

const newEntry = ref({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amountExpected: '0',
    amountReceived: '0',
});

const newExpense = ref({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '0',
});

function openEntryModal(entry?: Entry) {
    if (entry) {
        editingEntry.value = entry;
        newEntry.value = {
            date: entry.date,
            description: entry.description,
            amountExpected: entry.amountExpected,
            amountReceived: entry.amountReceived,
        };
    } else {
        editingEntry.value = null;
        newEntry.value = {
            date: new Date().toISOString().split('T')[0],
            description: '',
            amountExpected: '0',
            amountReceived: '0',
        };
    }
    showEntryModal.value = true;
}

function openExpenseModal(expense?: Expense) {
    if (expense) {
        editingExpense.value = expense;
        newExpense.value = {
            date: expense.date,
            description: expense.description,
            amount: expense.amount,
        };
    } else {
        editingExpense.value = null;
        newExpense.value = {
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: '0',
        };
    }
    showExpenseModal.value = true;
}

async function saveEntry() {
    isSubmitting.value = true;
    try {
        if (editingEntry.value) {
            await $fetch(`/api/entries/${editingEntry.value.id}`, {
                method: 'PUT',
                body: newEntry.value,
            });
        } else {
            await $fetch('/api/entries', {
                method: 'POST',
                body: { ...newEntry.value, cashFlowId: Number(id) },
            });
        }
        showEntryModal.value = false;
        await refresh();
    } catch (error: any) {
        alert(error.data?.message || 'Erro ao salvar entrada');
    } finally {
        isSubmitting.value = false;
    }
}

async function saveExpense() {
    isSubmitting.value = true;
    try {
        if (editingExpense.value) {
            await $fetch(`/api/expenses/${editingExpense.value.id}`, {
                method: 'PUT',
                body: newExpense.value,
            });
        } else {
            await $fetch('/api/expenses', {
                method: 'POST',
                body: { ...newExpense.value, cashFlowId: Number(id) },
            });
        }
        showExpenseModal.value = false;
        await refresh();
    } catch (error: any) {
        alert(error.data?.message || 'Erro ao salvar saída');
    } finally {
        isSubmitting.value = false;
    }
}

async function deleteEntry(entryId: number) {
    if (!confirm('Tem certeza que deseja excluir esta entrada?')) return;
    try {
        await $fetch(`/api/entries/${entryId}`, { method: 'DELETE' });
        await refresh();
    } catch (error: any) {
        alert(error.data?.message || 'Erro ao excluir entrada');
    }
}

async function deleteExpense(expenseId: number) {
    if (!confirm('Tem certeza que deseja excluir esta saída?')) return;
    try {
        await $fetch(`/api/expenses/${expenseId}`, { method: 'DELETE' });
        await refresh();
    } catch (error: any) {
        alert(error.data?.message || 'Erro ao excluir saída');
    }
}
</script>

<template>
    <div class="min-h-screen bg-bg-primary">
        <!-- Header -->
        <header class="border-b border-border bg-bg-secondary">
            <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <NuxtLink
                        to="/"
                        class="p-2 text-text-muted hover:text-text-primary hover:bg-bg-card rounded-lg transition-colors"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </NuxtLink>
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                            <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div v-if="cashFlow">
                            <h1 class="text-xl font-semibold text-text-primary">
                                {{ formatMonth(cashFlow.month) }} {{ cashFlow.year }}
                            </h1>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-6">
                    <span class="text-sm text-text-secondary">{{ user?.name }}</span>
                    <button
                        @click="logout"
                        class="text-danger hover:text-danger/80 text-sm transition-colors"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </header>

        <!-- Error State -->
        <div v-if="error" class="max-w-7xl mx-auto px-6 py-8">
            <div class="bg-danger-bg border border-danger/20 text-danger p-4 rounded-xl">
                Erro ao carregar fluxo de caixa
            </div>
        </div>

        <!-- Main Content -->
        <main v-else-if="cashFlow" class="max-w-7xl mx-auto px-6 py-8">
            <!-- Summary Cards -->
            <div class="grid gap-6 md:grid-cols-4 mb-8">
                <div class="bg-bg-card border border-border rounded-xl p-5">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-text-muted/10 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <p class="text-sm text-text-secondary">Saldo Inicial</p>
                    </div>
                    <p class="text-2xl font-semibold text-text-primary">
                        {{ formatCurrency(cashFlow.summary.initialBalance) }}
                    </p>
                </div>

                <div class="bg-bg-card border border-border rounded-xl p-5">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-success-bg rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                        </div>
                        <p class="text-sm text-text-secondary">Total Entradas</p>
                    </div>
                    <p class="text-2xl font-semibold text-success">
                        {{ formatCurrency(cashFlow.summary.totalEntries) }}
                    </p>
                </div>

                <div class="bg-bg-card border border-border rounded-xl p-5">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-danger-bg rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                        </div>
                        <p class="text-sm text-text-secondary">Total Saídas</p>
                    </div>
                    <p class="text-2xl font-semibold text-danger">
                        {{ formatCurrency(cashFlow.summary.totalExpenses) }}
                    </p>
                </div>

                <div class="bg-accent rounded-xl p-5">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p class="text-sm text-white/80">Saldo Final</p>
                    </div>
                    <p class="text-2xl font-semibold text-white">
                        {{ formatCurrency(cashFlow.summary.finalBalance) }}
                    </p>
                </div>
            </div>

            <!-- Entries Section -->
            <section class="mb-8">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-text-primary">Entradas (Receitas)</h2>
                    <button
                        @click="openEntryModal()"
                        class="bg-success text-white px-4 py-2 rounded-lg font-medium hover:bg-success/90 transition-colors flex items-center gap-2 text-sm"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Nova Entrada
                    </button>
                </div>

                <div class="bg-bg-card border border-border rounded-xl overflow-hidden">
                    <table v-if="cashFlow.entries.length > 0" class="w-full text-sm">
                        <thead class="bg-bg-secondary border-b border-border">
                            <tr>
                                <th class="px-6 py-4 text-left font-medium text-text-secondary">Data</th>
                                <th class="px-6 py-4 text-left font-medium text-text-secondary">Descrição</th>
                                <th class="px-6 py-4 text-right font-medium text-text-secondary">Previsto</th>
                                <th class="px-6 py-4 text-right font-medium text-text-secondary">Recebido</th>
                                <th class="px-6 py-4 w-28"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border">
                            <tr v-for="entry in cashFlow.entries" :key="entry.id" class="hover:bg-bg-card-hover transition-colors">
                                <td class="px-6 py-4 text-text-secondary">{{ formatDate(entry.date) }}</td>
                                <td class="px-6 py-4 text-text-primary">{{ entry.description }}</td>
                                <td class="px-6 py-4 text-right text-text-secondary">{{ formatCurrency(entry.amountExpected) }}</td>
                                <td class="px-6 py-4 text-right font-medium text-success">{{ formatCurrency(entry.amountReceived) }}</td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center justify-end gap-1">
                                        <button
                                            @click="openEntryModal(entry)"
                                            class="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            @click="deleteEntry(entry.id)"
                                            class="p-2 text-text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-else class="p-12 text-center">
                        <p class="text-text-muted">Nenhuma entrada cadastrada</p>
                    </div>
                </div>
            </section>

            <!-- Expenses Section -->
            <section>
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-text-primary">Saídas (Despesas)</h2>
                    <button
                        @click="openExpenseModal()"
                        class="bg-danger text-white px-4 py-2 rounded-lg font-medium hover:bg-danger/90 transition-colors flex items-center gap-2 text-sm"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Nova Saída
                    </button>
                </div>

                <div class="bg-bg-card border border-border rounded-xl overflow-hidden">
                    <table v-if="cashFlow.expenses.length > 0" class="w-full text-sm">
                        <thead class="bg-bg-secondary border-b border-border">
                            <tr>
                                <th class="px-6 py-4 text-left font-medium text-text-secondary">Data</th>
                                <th class="px-6 py-4 text-left font-medium text-text-secondary">Descrição</th>
                                <th class="px-6 py-4 text-right font-medium text-text-secondary">Valor</th>
                                <th class="px-6 py-4 w-28"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border">
                            <tr v-for="expense in cashFlow.expenses" :key="expense.id" class="hover:bg-bg-card-hover transition-colors">
                                <td class="px-6 py-4 text-text-secondary">{{ formatDate(expense.date) }}</td>
                                <td class="px-6 py-4 text-text-primary">{{ expense.description }}</td>
                                <td class="px-6 py-4 text-right font-medium text-danger">{{ formatCurrency(expense.amount) }}</td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center justify-end gap-1">
                                        <button
                                            @click="openExpenseModal(expense)"
                                            class="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            @click="deleteExpense(expense.id)"
                                            class="p-2 text-text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-else class="p-12 text-center">
                        <p class="text-text-muted">Nenhuma saída cadastrada</p>
                    </div>
                </div>
            </section>
        </main>

        <!-- Entry Modal -->
        <div
            v-if="showEntryModal"
            class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            @click.self="showEntryModal = false"
        >
            <div class="bg-bg-card border border-border rounded-xl p-6 w-full max-w-md">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-text-primary">
                        {{ editingEntry ? 'Editar Entrada' : 'Nova Entrada' }}
                    </h2>
                    <button
                        @click="showEntryModal = false"
                        class="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form @submit.prevent="saveEntry" class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-text-secondary mb-2">Data</label>
                        <input
                            v-model="newEntry.date"
                            type="date"
                            required
                            class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-secondary mb-2">Descrição</label>
                        <input
                            v-model="newEntry.description"
                            type="text"
                            required
                            class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                        />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-text-secondary mb-2">Valor Previsto</label>
                            <input
                                v-model="newEntry.amountExpected"
                                type="number"
                                step="0.01"
                                class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-text-secondary mb-2">Valor Recebido</label>
                            <input
                                v-model="newEntry.amountReceived"
                                type="number"
                                step="0.01"
                                class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                            />
                        </div>
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button
                            type="button"
                            @click="showEntryModal = false"
                            class="flex-1 px-4 py-2.5 border border-border rounded-lg text-text-primary hover:bg-bg-secondary transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            :disabled="isSubmitting"
                            class="flex-1 px-4 py-2.5 bg-success text-white rounded-lg font-medium hover:bg-success/90 transition-colors disabled:opacity-50"
                        >
                            {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Expense Modal -->
        <div
            v-if="showExpenseModal"
            class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            @click.self="showExpenseModal = false"
        >
            <div class="bg-bg-card border border-border rounded-xl p-6 w-full max-w-md">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-text-primary">
                        {{ editingExpense ? 'Editar Saída' : 'Nova Saída' }}
                    </h2>
                    <button
                        @click="showExpenseModal = false"
                        class="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form @submit.prevent="saveExpense" class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-text-secondary mb-2">Data</label>
                        <input
                            v-model="newExpense.date"
                            type="date"
                            required
                            class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-secondary mb-2">Descrição</label>
                        <input
                            v-model="newExpense.description"
                            type="text"
                            required
                            class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-secondary mb-2">Valor (R$)</label>
                        <input
                            v-model="newExpense.amount"
                            type="number"
                            step="0.01"
                            class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                        />
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button
                            type="button"
                            @click="showExpenseModal = false"
                            class="flex-1 px-4 py-2.5 border border-border rounded-lg text-text-primary hover:bg-bg-secondary transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            :disabled="isSubmitting"
                            class="flex-1 px-4 py-2.5 bg-danger text-white rounded-lg font-medium hover:bg-danger/90 transition-colors disabled:opacity-50"
                        >
                            {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
