<script setup lang="ts">
const { user: currentUser, logout } = useAuth();

// Proteger página - apenas admins
if (!currentUser.value?.isAdmin) {
    await navigateTo('/');
}

interface User {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
}

const { data: users, refresh } = await useFetch<User[]>('/api/users');

const showModal = ref(false);
const newUser = ref({
    name: '',
    email: '',
    password: '',
    isAdmin: false,
});
const isSubmitting = ref(false);
const errorMessage = ref('');

async function createUser() {
    isSubmitting.value = true;
    errorMessage.value = '';

    try {
        await $fetch('/api/users', {
            method: 'POST',
            body: newUser.value,
        });
        showModal.value = false;
        newUser.value = {
            name: '',
            email: '',
            password: '',
            isAdmin: false,
        };
        await refresh();
    } catch (error: any) {
        errorMessage.value = error.data?.message || 'Erro ao criar usuário';
    } finally {
        isSubmitting.value = false;
    }
}

async function deleteUser(id: number) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
        return;
    }

    try {
        await $fetch(`/api/users/${id}`, {
            method: 'DELETE',
        });
        await refresh();
    } catch (error: any) {
        alert(error.data?.message || 'Erro ao excluir usuário');
    }
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR');
}
</script>

<template>
    <NuxtLayout name="default">
        <template v-slot:headerTitle>Gerenciar Usuários</template>
        <template v-slot:headerDescription>Adicione e gerencie usuários do sistema</template>
        <template v-slot:headerActions>
            <button
                @click="showModal = true"
                class="bg-accent text-white px-4 py-2.5 rounded-lg font-medium hover:bg-accent-hover transition-colors flex items-center gap-2"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Novo Usuário
            </button>
        </template>

        <!-- Users Table -->
        <div class="bg-bg-card border border-border rounded-xl overflow-hidden">
            <table v-if="users && users.length > 0" class="w-full text-sm">
                <thead class="bg-bg-secondary border-b border-border">
                    <tr>
                        <th class="px-6 py-4 text-left font-medium text-text-secondary">Nome</th>
                        <th class="px-6 py-4 text-left font-medium text-text-secondary">Email</th>
                        <th class="px-6 py-4 text-center font-medium text-text-secondary">Admin</th>
                        <th class="px-6 py-4 text-left font-medium text-text-secondary">Criado em</th>
                        <th class="px-6 py-4 w-24"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    <tr v-for="user in users" :key="user.id" class="hover:bg-bg-card-hover transition-colors">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                                    <span class="text-accent font-medium text-sm">
                                        {{ user.name.charAt(0).toUpperCase() }}
                                    </span>
                                </div>
                                <span class="font-medium text-text-primary">{{ user.name }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-text-secondary">{{ user.email }}</td>
                        <td class="px-6 py-4 text-center">
                            <span
                                v-if="user.isAdmin"
                                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success-bg text-success border border-success/20"
                            >
                                Admin
                            </span>
                            <span
                                v-else
                                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-bg-secondary text-text-muted border border-border"
                            >
                                Usuário
                            </span>
                        </td>
                        <td class="px-6 py-4 text-text-secondary">
                            {{ formatDate(user.createdAt) }}
                        </td>
                        <td class="px-6 py-4 text-right">
                            <button
                                v-if="user.id !== currentUser?.id"
                                @click="deleteUser(user.id)"
                                class="p-2 text-text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors"
                                title="Excluir"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                            <span v-else class="text-text-muted text-xs px-2">(você)</span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-else class="p-12 text-center">
                <div class="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                    </svg>
                </div>
                <p class="text-text-secondary">Nenhum usuário cadastrado</p>
            </div>
        </div>

        <!-- Modal -->
        <div
            v-if="showModal"
            class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            @click.self="showModal = false"
        >
            <div class="bg-bg-card border border-border rounded-xl p-6 w-full max-w-md">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-text-primary">Novo Usuário</h2>
                    <button
                        @click="showModal = false"
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

                <div
                    v-if="errorMessage"
                    class="mb-4 p-3 bg-danger-bg border border-danger/20 text-danger rounded-lg text-sm"
                >
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="createUser" class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-text-secondary mb-2">Nome</label>
                        <input
                            v-model="newUser.name"
                            type="text"
                            required
                            class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-secondary mb-2">Email</label>
                        <input
                            v-model="newUser.email"
                            type="email"
                            required
                            class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-text-secondary mb-2">Senha</label>
                        <input
                            v-model="newUser.password"
                            type="password"
                            required
                            minlength="6"
                            class="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                        />
                        <p class="text-xs text-text-muted mt-1.5">Mínimo de 6 caracteres</p>
                    </div>

                    <div class="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg">
                        <input
                            id="isAdmin"
                            v-model="newUser.isAdmin"
                            type="checkbox"
                            class="w-4 h-4 rounded border-border bg-bg-input text-accent focus:ring-accent focus:ring-offset-0"
                        />
                        <label for="isAdmin" class="text-sm text-text-primary">
                            Conceder privilégios de administrador
                        </label>
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
    </NuxtLayout>
</template>
