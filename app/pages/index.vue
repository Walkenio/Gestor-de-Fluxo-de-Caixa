<script setup lang="ts">
const { user, logout } = useAuth();

interface CashFlow {
    id: number;
    month: number;
    year: number;
    initialBalance: string;
    createdAt: string;
}

const { data: cashFlows, refresh } = await useFetch<CashFlow[]>(
    '/api/cash-flows'
);

const showModal = ref(false);
const newCashFlow = ref({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    initialBalance: '0',
});
const isSubmitting = ref(false);
const errorMessage = ref('');

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

async function createCashFlow() {
    isSubmitting.value = true;
    errorMessage.value = '';

    try {
        await $fetch('/api/cash-flows', {
            method: 'POST',
            body: newCashFlow.value,
        });
        showModal.value = false;
        newCashFlow.value = {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            initialBalance: '0',
        };
        await refresh();
    } catch (error: any) {
        errorMessage.value =
            error.data?.message || 'Erro ao criar fluxo de caixa';
    } finally {
        isSubmitting.value = false;
    }
}

async function deleteCashFlow(id: number) {
    if (!confirm('Tem certeza que deseja excluir este fluxo de caixa?')) {
        return;
    }

    try {
        await $fetch(`/api/cash-flows/${id}`, {
            method: 'DELETE',
        });
        await refresh();
    } catch (error: any) {
        alert(error.data?.message || 'Erro ao excluir fluxo de caixa');
    }
}
</script>

<template>
    <div class="min-h-screen bg-bg-primary">
        <!-- Header -->
        <header class="border-b border-border bg-bg-secondary">
            <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                        <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 class="text-xl font-semibold text-text-primary">Fluxo de Caixa</h1>
                </div>
                <div class="flex items-center gap-6">
                    <span class="text-sm text-text-secondary">{{ user?.name }}</span>
                    <NuxtLink
                        v-if="user?.isAdmin"
                        to="/users"
                        class="text-text-secondary hover:text-text-primary text-sm transition-colors"
                    >
                        Usuários
                    </NuxtLink>
                    <button
                        @click="logout"
                        class="text-danger hover:text-danger/80 text-sm transition-colors"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-6 py-8">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-2xl font-bold text-text-primary">Meus Fluxos</h2>
                    <p class="mt-1 text-text-secondary">
                        Controle financeiro mensal de entradas e saídas
                    </p>
                </div>
                <button
                    @click="showModal = true"
                    class="bg-accent text-white px-4 py-2.5 rounded-lg font-medium hover:bg-accent-hover transition-colors flex items-center gap-2"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Novo Mês
                </button>
            </div>

            <!-- Cards Grid -->
            <div
                v-if="cashFlows && cashFlows.length > 0"
                class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
                <NuxtLink
                    v-for="cf in cashFlows"
                    :key="cf.id"
                    :to="`/cash-flow/${cf.id}`"
                    class="bg-bg-card border border-border rounded-xl p-6 hover:border-accent/50 hover:bg-bg-card-hover transition-all group"
                >
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="flex items-center gap-3 mb-3">
                                <div class="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-text-primary">
                                        {{ formatMonth(cf.month) }}
                                    </h3>
                                    <p class="text-sm text-text-muted">{{ cf.year }}</p>
                                </div>
                            </div>
                            <div class="mt-4">
                                <p class="text-xs text-text-muted uppercase tracking-wide">Saldo Inicial</p>
                                <p class="text-xl font-semibold text-text-primary mt-1">
                                    {{ formatCurrency(cf.initialBalance) }}
                                </p>
                            </div>
                        </div>
                        <button
                            @click.prevent="deleteCashFlow(cf.id)"
                            class="p-2 text-text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Excluir"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                    <div class="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <span class="text-sm text-accent group-hover:text-accent-hover transition-colors">
                            Ver detalhes
                        </span>
                        <svg class="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </NuxtLink>
            </div>

            <!-- Empty State -->
            <div
                v-else
                class="bg-bg-card border border-border rounded-xl p-12 text-center"
            >
                <div class="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <p class="text-text-secondary">Nenhum fluxo de caixa cadastrado.</p>
                <p class="text-text-muted mt-1">Clique em "Novo Mês" para começar.</p>
            </div>
        </main>

        <!-- Modal -->
        <div
            v-if="showModal"
            class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            @click.self="showModal = false"
        >
            <div class="bg-bg-card border border-border rounded-xl p-6 w-full max-w-md">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-text-primary">Novo Fluxo de Caixa</h2>
                    <button
                        @click="showModal = false"
                        class="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div
                    v-if="errorMessage"
                    class="mb-4 p-3 bg-danger-bg border border-danger/20 text-danger rounded-lg text-sm"
                >
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="createCashFlow" class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-text-secondary mb-2">
                            Mês
                        </label>
                        <select
                            v-model="newCashFlow.month"
                            class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                        >
                            <option
                                v-for="(name, index) in monthNames"
                                :key="index"
                                :value="index + 1"
                            >
                                {{ name }}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-secondary mb-2">
                            Ano
                        </label>
                        <input
                            v-model.number="newCashFlow.year"
                            type="number"
                            min="2000"
                            max="2100"
                            class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-secondary mb-2">
                            Saldo Inicial (R$)
                        </label>
                        <input
                            v-model="newCashFlow.initialBalance"
                            type="number"
                            step="0.01"
                            class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                        />
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button
                            type="button"
                            @click="showModal = false"
                            class="flex-1 px-4 py-2.5 border border-border rounded-lg text-text-primary hover:bg-bg-secondary transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            :disabled="isSubmitting"
                            class="flex-1 px-4 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                        >
                            {{ isSubmitting ? 'Criando...' : 'Criar' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
