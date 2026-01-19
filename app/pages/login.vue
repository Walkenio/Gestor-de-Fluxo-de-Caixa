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
        class="min-h-screen bg-bg-primary flex items-center justify-center px-4"
    >
        <div class="w-full max-w-md">
            <div class="bg-bg-card border border-border rounded-xl p-8">
                <div class="text-center mb-8">
                    <div
                        class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4"
                    >
                        <svg
                            class="w-6 h-6 text-accent"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h1 class="text-2xl font-bold text-text-primary">
                        Fluxo de Caixa
                    </h1>
                    <p class="text-text-secondary mt-2">
                        Entre com suas credenciais
                    </p>
                </div>

                <div
                    v-if="errorMessage"
                    class="mb-4 p-3 bg-danger-bg border border-danger/20 text-danger rounded-lg text-sm"
                >
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="handleLogin" class="space-y-5">
                    <div>
                        <label
                            for="email"
                            class="block text-sm font-medium text-text-secondary mb-2"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            v-model="email"
                            type="email"
                            autocomplete="email"
                            required
                            class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label
                            for="password"
                            class="block text-sm font-medium text-text-secondary mb-2"
                        >
                            Senha
                        </label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            autocomplete="current-password"
                            required
                            class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                            placeholder="Sua senha"
                        />
                    </div>

                    <button
                        type="submit"
                        :disabled="isLoading"
                        class="w-full bg-accent text-white py-2.5 px-4 rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {{ isLoading ? 'Entrando...' : 'Entrar' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>
