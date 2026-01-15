<script setup lang="ts">
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
    <div class="max-w-6xl mx-auto px-4 py-8">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Fluxo de Caixa</h1>
            <p class="mt-2 text-gray-600">
                Controle financeiro mensal de entradas e saídas
            </p>
        </header>

        <div class="mb-6">
            <button
                @click="showModal = true"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
                + Novo Mês
            </button>
        </div>

        <div
            v-if="cashFlows && cashFlows.length > 0"
            class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
            <div
                v-for="cf in cashFlows"
                :key="cf.id"
                class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-xl font-semibold text-gray-900">
                            {{ formatMonth(cf.month) }} {{ cf.year }}
                        </h2>
                        <p class="text-sm text-gray-500 mt-1">
                            Saldo inicial:
                            {{ formatCurrency(cf.initialBalance) }}
                        </p>
                    </div>
                    <button
                        @click.stop="deleteCashFlow(cf.id)"
                        class="text-red-500 hover:text-red-700 p-1"
                        title="Excluir"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
                <NuxtLink
                    :to="`/cash-flow/${cf.id}`"
                    class="mt-4 inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Ver detalhes &rarr;
                </NuxtLink>
            </div>
        </div>

        <div
            v-else
            class="bg-white rounded-lg shadow-md p-8 text-center text-gray-500"
        >
            <p>Nenhum fluxo de caixa cadastrado.</p>
            <p class="mt-2">Clique em "Novo Mês" para começar.</p>
        </div>

        <!-- Modal -->
        <div
            v-if="showModal"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            @click.self="showModal = false"
        >
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h2 class="text-xl font-semibold mb-4">Novo Fluxo de Caixa</h2>

                <div
                    v-if="errorMessage"
                    class="mb-4 p-3 bg-red-100 text-red-700 rounded"
                >
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="createCashFlow" class="space-y-4">
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Mês
                        </label>
                        <select
                            v-model="newCashFlow.month"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Ano
                        </label>
                        <input
                            v-model.number="newCashFlow.year"
                            type="number"
                            min="2000"
                            max="2100"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Saldo Inicial (R$)
                        </label>
                        <input
                            v-model="newCashFlow.initialBalance"
                            type="number"
                            step="0.01"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button
                            type="button"
                            @click="showModal = false"
                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            :disabled="isSubmitting"
                            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {{ isSubmitting ? 'Criando...' : 'Criar' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
