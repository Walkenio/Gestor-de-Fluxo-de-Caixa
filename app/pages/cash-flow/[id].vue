<script setup lang="ts">
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
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];

function formatMonth(month: number): string {
    return monthNames[month - 1];
}

function formatCurrency(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

// Modal states
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
                body: {
                    ...newEntry.value,
                    cashFlowId: Number(id),
                },
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
                body: {
                    ...newExpense.value,
                    cashFlowId: Number(id),
                },
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
    <div class="max-w-6xl mx-auto px-4 py-8">
        <div v-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg">
            Erro ao carregar fluxo de caixa
        </div>

        <div v-else-if="cashFlow">
            <!-- Header -->
            <header class="mb-8">
                <NuxtLink
                    to="/"
                    class="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
                >
                    &larr; Voltar
                </NuxtLink>
                <h1 class="text-3xl font-bold text-gray-900">
                    {{ formatMonth(cashFlow.month) }} {{ cashFlow.year }}
                </h1>
            </header>

            <!-- Summary Cards -->
            <div class="grid gap-4 md:grid-cols-4 mb-8">
                <div class="bg-white rounded-lg shadow p-4">
                    <p class="text-sm text-gray-500">Saldo Inicial</p>
                    <p class="text-xl font-semibold text-gray-900">
                        {{ formatCurrency(cashFlow.summary.initialBalance) }}
                    </p>
                </div>
                <div class="bg-white rounded-lg shadow p-4">
                    <p class="text-sm text-gray-500">Total Entradas</p>
                    <p class="text-xl font-semibold text-green-600">
                        {{ formatCurrency(cashFlow.summary.totalEntries) }}
                    </p>
                </div>
                <div class="bg-white rounded-lg shadow p-4">
                    <p class="text-sm text-gray-500">Total Saídas</p>
                    <p class="text-xl font-semibold text-red-600">
                        {{ formatCurrency(cashFlow.summary.totalExpenses) }}
                    </p>
                </div>
                <div class="bg-blue-600 rounded-lg shadow p-4">
                    <p class="text-sm text-blue-100">Saldo Final (Caixa)</p>
                    <p class="text-xl font-semibold text-white">
                        {{ formatCurrency(cashFlow.summary.finalBalance) }}
                    </p>
                </div>
            </div>

            <!-- Entries Section -->
            <section class="mb-8">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-gray-900">
                        Entradas (Receitas)
                    </h2>
                    <button
                        @click="openEntryModal()"
                        class="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm"
                    >
                        + Nova Entrada
                    </button>
                </div>

                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <table
                        v-if="cashFlow.entries.length > 0"
                        class="w-full text-sm"
                    >
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-4 py-3 text-left font-medium text-gray-600"
                                >
                                    Data
                                </th>
                                <th
                                    class="px-4 py-3 text-left font-medium text-gray-600"
                                >
                                    Descrição
                                </th>
                                <th
                                    class="px-4 py-3 text-right font-medium text-gray-600"
                                >
                                    Valor Previsto
                                </th>
                                <th
                                    class="px-4 py-3 text-right font-medium text-gray-600"
                                >
                                    Valor Recebido
                                </th>
                                <th class="px-4 py-3 w-24"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr
                                v-for="entry in cashFlow.entries"
                                :key="entry.id"
                                class="hover:bg-gray-50"
                            >
                                <td class="px-4 py-3">
                                    {{ formatDate(entry.date) }}
                                </td>
                                <td class="px-4 py-3">
                                    {{ entry.description }}
                                </td>
                                <td class="px-4 py-3 text-right">
                                    {{ formatCurrency(entry.amountExpected) }}
                                </td>
                                <td
                                    class="px-4 py-3 text-right font-medium text-green-600"
                                >
                                    {{ formatCurrency(entry.amountReceived) }}
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <button
                                        @click="openEntryModal(entry)"
                                        class="text-blue-600 hover:text-blue-800 mr-2"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        @click="deleteEntry(entry.id)"
                                        class="text-red-600 hover:text-red-800"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-else class="p-8 text-center text-gray-500">
                        Nenhuma entrada cadastrada
                    </div>
                </div>
            </section>

            <!-- Expenses Section -->
            <section>
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-gray-900">
                        Saídas (Despesas)
                    </h2>
                    <button
                        @click="openExpenseModal()"
                        class="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 text-sm"
                    >
                        + Nova Saída
                    </button>
                </div>

                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <table
                        v-if="cashFlow.expenses.length > 0"
                        class="w-full text-sm"
                    >
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-4 py-3 text-left font-medium text-gray-600"
                                >
                                    Data
                                </th>
                                <th
                                    class="px-4 py-3 text-left font-medium text-gray-600"
                                >
                                    Descrição
                                </th>
                                <th
                                    class="px-4 py-3 text-right font-medium text-gray-600"
                                >
                                    Valor
                                </th>
                                <th class="px-4 py-3 w-24"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr
                                v-for="expense in cashFlow.expenses"
                                :key="expense.id"
                                class="hover:bg-gray-50"
                            >
                                <td class="px-4 py-3">
                                    {{ formatDate(expense.date) }}
                                </td>
                                <td class="px-4 py-3">
                                    {{ expense.description }}
                                </td>
                                <td
                                    class="px-4 py-3 text-right font-medium text-red-600"
                                >
                                    {{ formatCurrency(expense.amount) }}
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <button
                                        @click="openExpenseModal(expense)"
                                        class="text-blue-600 hover:text-blue-800 mr-2"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        @click="deleteExpense(expense.id)"
                                        class="text-red-600 hover:text-red-800"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-else class="p-8 text-center text-gray-500">
                        Nenhuma saída cadastrada
                    </div>
                </div>
            </section>
        </div>

        <!-- Entry Modal -->
        <div
            v-if="showEntryModal"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            @click.self="showEntryModal = false"
        >
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h2 class="text-xl font-semibold mb-4">
                    {{ editingEntry ? 'Editar Entrada' : 'Nova Entrada' }}
                </h2>

                <form @submit.prevent="saveEntry" class="space-y-4">
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Data
                        </label>
                        <input
                            v-model="newEntry.date"
                            type="date"
                            required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Descrição
                        </label>
                        <input
                            v-model="newEntry.description"
                            type="text"
                            required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Valor Previsto (R$)
                        </label>
                        <input
                            v-model="newEntry.amountExpected"
                            type="number"
                            step="0.01"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Valor Recebido (R$)
                        </label>
                        <input
                            v-model="newEntry.amountReceived"
                            type="number"
                            step="0.01"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button
                            type="button"
                            @click="showEntryModal = false"
                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            :disabled="isSubmitting"
                            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            @click.self="showExpenseModal = false"
        >
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h2 class="text-xl font-semibold mb-4">
                    {{ editingExpense ? 'Editar Saída' : 'Nova Saída' }}
                </h2>

                <form @submit.prevent="saveExpense" class="space-y-4">
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Data
                        </label>
                        <input
                            v-model="newExpense.date"
                            type="date"
                            required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Descrição
                        </label>
                        <input
                            v-model="newExpense.description"
                            type="text"
                            required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Valor (R$)
                        </label>
                        <input
                            v-model="newExpense.amount"
                            type="number"
                            step="0.01"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button
                            type="button"
                            @click="showExpenseModal = false"
                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            :disabled="isSubmitting"
                            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
