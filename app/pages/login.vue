<script setup lang="ts">
definePageMeta({
    layout: false,
});

const { login } = useAuth();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

async function handleLogin() {
    if (!email.value || !password.value) {
        errorMessage.value = 'Preencha todos os campos';
        return;
    }

    isLoading.value = true;
    errorMessage.value = '';

    try {
        await login(email.value, password.value);
        await navigateTo('/');
    } catch (error: any) {
        errorMessage.value = error.data?.message || 'Erro ao fazer login';
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div
        class="min-h-screen bg-gray-100 flex items-center justify-center px-4"
    >
        <div class="w-full max-w-md">
            <div class="bg-white rounded-lg shadow-lg p-8">
                <div class="text-center mb-8">
                    <h1 class="text-2xl font-bold text-gray-900">
                        Fluxo de Caixa
                    </h1>
                    <p class="text-gray-600 mt-2">
                        Entre com suas credenciais
                    </p>
                </div>

                <div
                    v-if="errorMessage"
                    class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm"
                >
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="handleLogin" class="space-y-4">
                    <div>
                        <label
                            for="email"
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            v-model="email"
                            type="email"
                            autocomplete="email"
                            required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label
                            for="password"
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Senha
                        </label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            autocomplete="current-password"
                            required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Sua senha"
                        />
                    </div>

                    <button
                        type="submit"
                        :disabled="isLoading"
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {{ isLoading ? 'Entrando...' : 'Entrar' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>
