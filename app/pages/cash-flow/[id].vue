<script setup lang="ts">
const { user, logout } = useAuth();

interface Tag {
    id: number;
    name: string;
    color: string;
}

interface Entry {
    id: number;
    cashFlowId: number;
    date: string;
    description: string;
    amountExpected: string;
    amountReceived: string;
    tags: Tag[];
}

interface Expense {
    id: number;
    cashFlowId: number;
    date: string;
    description: string;
    amount: string;
    tags: Tag[];
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

const { data: cashFlow, refresh, error } = await useFetch<CashFlowDetail>(`/api/cash-flows/${id}`);

// Buscar todas as tags disponíveis
const { data: availableTags, refresh: refreshTags } = await useFetch<Tag[]>('/api/tags');

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
    return monthNames[month - 1] || '';
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
const showTagModal = ref(false);
const editingEntry = ref<Entry | null>(null);
const editingExpense = ref<Expense | null>(null);
const isSubmitting = ref(false);

const newEntry = ref({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amountExpected: '0',
    amountReceived: '0',
});
const selectedEntryTagIds = ref<number[]>([]);

const newExpense = ref({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '0',
});
const selectedExpenseTagIds = ref<number[]>([]);

const newTagName = ref('');
const newTagColor = ref('#6366f1');
const isCreatingTag = ref(false);

const tagColors = [
    '#6366f1', // indigo
    '#22c55e', // green
    '#ef4444', // red
    '#f59e0b', // amber
    '#3b82f6', // blue
    '#ec4899', // pink
    '#8b5cf6', // violet
    '#14b8a6', // teal
];

onBeforeMount(() => {
    newTagColor.value = tagColors[Math.floor(Math.random() * tagColors.length)] || '#6366f1';
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
        selectedEntryTagIds.value = entry.tags.map((t) => t.id);
    } else {
        editingEntry.value = null;
        newEntry.value = {
            date: new Date().toISOString().split('T')[0],
            description: '',
            amountExpected: '0',
            amountReceived: '0',
        };
        selectedEntryTagIds.value = [];
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
        selectedExpenseTagIds.value = expense.tags.map((t) => t.id);
    } else {
        editingExpense.value = null;
        newExpense.value = {
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: '0',
        };
        selectedExpenseTagIds.value = [];
    }
    showExpenseModal.value = true;
}

function toggleEntryTag(tagId: number) {
    const index = selectedEntryTagIds.value.indexOf(tagId);
    if (index === -1) {
        selectedEntryTagIds.value.push(tagId);
    } else {
        selectedEntryTagIds.value.splice(index, 1);
    }
}

function toggleExpenseTag(tagId: number) {
    const index = selectedExpenseTagIds.value.indexOf(tagId);
    if (index === -1) {
        selectedExpenseTagIds.value.push(tagId);
    } else {
        selectedExpenseTagIds.value.splice(index, 1);
    }
}

async function createTag() {
    if (!newTagName.value.trim()) return;

    isCreatingTag.value = true;
    try {
        await $fetch('/api/tags', {
            method: 'POST',
            body: {
                name: newTagName.value.trim(),
                color: newTagColor.value,
            },
        });
        newTagName.value = '';
        newTagColor.value = '#6366f1';
        showTagModal.value = false;
        await refreshTags();
    } catch (error: any) {
        alert(error.data?.message || 'Erro ao criar tag');
    } finally {
        isCreatingTag.value = false;
    }
}

async function deleteTag(tagId: number) {
    if (!confirm('Tem certeza que deseja excluir esta tag?')) return;
    try {
        await $fetch(`/api/tags/${tagId}`, { method: 'DELETE' });
        await refreshTags();
        await refresh();
    } catch (error: any) {
        alert(error.data?.message || 'Erro ao excluir tag');
    }
}

async function saveEntry() {
    isSubmitting.value = true;
    try {
        if (editingEntry.value) {
            await $fetch(`/api/entries/${editingEntry.value.id}`, {
                method: 'PUT',
                body: { ...newEntry.value, tagIds: selectedEntryTagIds.value },
            });
        } else {
            await $fetch('/api/entries', {
                method: 'POST',
                body: { ...newEntry.value, cashFlowId: Number(id), tagIds: selectedEntryTagIds.value },
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
                body: { ...newExpense.value, tagIds: selectedExpenseTagIds.value },
            });
        } else {
            await $fetch('/api/expenses', {
                method: 'POST',
                body: { ...newExpense.value, cashFlowId: Number(id), tagIds: selectedExpenseTagIds.value },
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
    <NuxtLayout name="default">
        <AdminBreadcrumb />

        <!-- Error State -->
        <div v-if="error" class="max-w-7xl mx-auto px-6 py-8">
            <div class="bg-danger-bg border border-danger/20 text-danger p-4 rounded-xl">
                Erro ao carregar fluxo de caixa
            </div>
        </div>

        <!-- Main Content -->
        <div v-else-if="cashFlow" class=" px-6 py-8">
            <!-- Summary Cards -->
            <div class="grid gap-6 md:grid-cols-4 mb-8">
                <div class="bg-bg-card border border-border rounded-xl p-5">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-text-muted/10 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
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
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                                />
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
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                                />
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
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
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
                                <th class="px-6 py-4 text-left font-medium text-text-secondary">Tags</th>
                                <th class="px-6 py-4 text-right font-medium text-text-secondary">Previsto</th>
                                <th class="px-6 py-4 text-right font-medium text-text-secondary">Recebido</th>
                                <th class="px-6 py-4 w-28"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border">
                            <tr
                                v-for="entry in cashFlow.entries"
                                :key="entry.id"
                                class="hover:bg-bg-card-hover transition-colors"
                            >
                                <td class="px-6 py-4 text-text-secondary">{{ formatDate(entry.date) }}</td>
                                <td class="px-6 py-4 text-text-primary">{{ entry.description }}</td>
                                <td class="px-6 py-4">
                                    <div class="flex flex-wrap gap-1">
                                        <span
                                            v-for="tag in entry.tags"
                                            :key="tag.id"
                                            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                            :style="{ backgroundColor: tag.color }"
                                        >
                                            {{ tag.name }}
                                        </span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-right text-text-secondary">
                                    {{ formatCurrency(entry.amountExpected) }}
                                </td>
                                <td class="px-6 py-4 text-right font-medium text-success">
                                    {{ formatCurrency(entry.amountReceived) }}
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center justify-end gap-1">
                                        <button
                                            @click="openEntryModal(entry)"
                                            class="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            @click="deleteEntry(entry.id)"
                                            class="p-2 text-text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
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
                                <th class="px-6 py-4 text-left font-medium text-text-secondary">Tags</th>
                                <th class="px-6 py-4 text-right font-medium text-text-secondary">Valor</th>
                                <th class="px-6 py-4 w-28"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border">
                            <tr
                                v-for="expense in cashFlow.expenses"
                                :key="expense.id"
                                class="hover:bg-bg-card-hover transition-colors"
                            >
                                <td class="px-6 py-4 text-text-secondary">{{ formatDate(expense.date) }}</td>
                                <td class="px-6 py-4 text-text-primary">{{ expense.description }}</td>
                                <td class="px-6 py-4">
                                    <div class="flex flex-wrap gap-1">
                                        <span
                                            v-for="tag in expense.tags"
                                            :key="tag.id"
                                            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                            :style="{ backgroundColor: tag.color }"
                                        >
                                            {{ tag.name }}
                                        </span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-right font-medium text-danger">
                                    {{ formatCurrency(expense.amount) }}
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center justify-end gap-1">
                                        <button
                                            @click="openExpenseModal(expense)"
                                            class="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            @click="deleteExpense(expense.id)"
                                            class="p-2 text-text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
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
        </div>

        <!-- Entry Modal -->
        <div
            v-if="showEntryModal"
            class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            @click.self="showEntryModal = false"
        >
            <div class="bg-bg-card border border-border rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-text-primary">
                        {{ editingEntry ? 'Editar Entrada' : 'Nova Entrada' }}
                    </h2>
                    <button
                        @click="showEntryModal = false"
                        class="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
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

                    <!-- Tags Selection -->
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <label class="block text-sm font-medium text-text-secondary">Tags</label>
                            <button
                                type="button"
                                @click="showTagModal = true"
                                class="text-xs text-accent hover:text-accent-hover transition-colors"
                            >
                                + Nova Tag
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-2 p-3 bg-bg-secondary rounded-lg min-h-[60px]">
                            <button
                                v-for="tag in availableTags"
                                :key="tag.id"
                                type="button"
                                @click="toggleEntryTag(tag.id)"
                                class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                                :class="
                                    selectedEntryTagIds.includes(tag.id)
                                        ? 'text-white ring-2 ring-white/30'
                                        : 'text-white/70 opacity-50 hover:opacity-80'
                                "
                                :style="{ backgroundColor: tag.color }"
                            >
                                {{ tag.name }}
                                <svg
                                    v-if="selectedEntryTagIds.includes(tag.id)"
                                    class="w-3 h-3 ml-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </button>
                            <span v-if="!availableTags || availableTags.length === 0" class="text-text-muted text-xs">
                                Nenhuma tag criada
                            </span>
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
            <div class="bg-bg-card border border-border rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-text-primary">
                        {{ editingExpense ? 'Editar Saída' : 'Nova Saída' }}
                    </h2>
                    <button
                        @click="showExpenseModal = false"
                        class="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
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

                    <!-- Tags Selection -->
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <label class="block text-sm font-medium text-text-secondary">Tags</label>
                            <button
                                type="button"
                                @click="showTagModal = true"
                                class="text-xs text-accent hover:text-accent-hover transition-colors"
                            >
                                + Nova Tag
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-2 p-3 bg-bg-secondary rounded-lg min-h-[60px]">
                            <button
                                v-for="tag in availableTags"
                                :key="tag.id"
                                type="button"
                                @click="toggleExpenseTag(tag.id)"
                                class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                                :class="
                                    selectedExpenseTagIds.includes(tag.id)
                                        ? 'text-white ring-2 ring-white/30'
                                        : 'text-white/70 opacity-50 hover:opacity-80'
                                "
                                :style="{ backgroundColor: tag.color }"
                            >
                                {{ tag.name }}
                                <svg
                                    v-if="selectedExpenseTagIds.includes(tag.id)"
                                    class="w-3 h-3 ml-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </button>
                            <span v-if="!availableTags || availableTags.length === 0" class="text-text-muted text-xs">
                                Nenhuma tag criada
                            </span>
                        </div>
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

        <!-- Tag Creation Modal -->
        <div
            v-if="showTagModal"
            class="fixed inset-0 bg-black/70 flex items-center justify-center z-60 p-4"
            @click.self="showTagModal = false"
        >
            <div class="bg-bg-card border border-border rounded-xl p-6 w-full max-w-sm">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg font-semibold text-text-primary">Nova Tag</h2>
                    <button
                        @click="showTagModal = false"
                        class="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <form @submit.prevent="createTag" class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-text-secondary mb-2">Nome</label>
                        <input
                            v-model="newTagName"
                            type="text"
                            required
                            placeholder="Ex: Alimentação, Salário..."
                            class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-secondary mb-2">Cor</label>
                        <div class="flex flex-wrap gap-2">
                            <button
                                v-for="color in tagColors"
                                :key="color"
                                type="button"
                                @click="newTagColor = color"
                                class="w-8 h-8 rounded-full transition-all"
                                :class="
                                    newTagColor === color
                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-card'
                                        : 'hover:scale-110'
                                "
                                :style="{ backgroundColor: color }"
                            />
                        </div>
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button
                            type="button"
                            @click="showTagModal = false"
                            class="flex-1 px-4 py-2.5 border border-border rounded-lg text-text-primary hover:bg-bg-secondary transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            :disabled="isCreatingTag || !newTagName.trim()"
                            class="flex-1 px-4 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                        >
                            {{ isCreatingTag ? 'Criando...' : 'Criar' }}
                        </button>
                    </div>
                </form>

                <!-- Existing Tags List -->
                <div v-if="availableTags && availableTags.length > 0" class="mt-6 pt-6 border-t border-border">
                    <p class="text-sm font-medium text-text-secondary mb-3">Tags existentes</p>
                    <div class="flex flex-wrap gap-2">
                        <div
                            v-for="tag in availableTags"
                            :key="tag.id"
                            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white group"
                            :style="{ backgroundColor: tag.color }"
                        >
                            {{ tag.name }}
                            <button
                                type="button"
                                @click="deleteTag(tag.id)"
                                class="opacity-0 group-hover:opacity-100 hover:text-red-200 transition-opacity"
                            >
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </NuxtLayout>
</template>
