<script setup lang="ts">
interface User {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
}

const { user: currentUser, logout } = useAuth();
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
    <div class="max-w-6xl mx-auto px-4 py-8">
        <!-- Header -->
        <header class="mb-8 flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Usuários</h1>
                <p class="mt-2 text-gray-600">
                    Gerenciamento de usuários do sistema
                </p>
            </div>
            <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600">
                    {{ currentUser?.name }}
                </span>
                <NuxtLink
                    to="/"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                >
                    Fluxo de Caixa
                </NuxtLink>
                <button
                    @click="logout"
                    class="text-red-600 hover:text-red-800 text-sm"
                >
                    Sair
                </button>
            </div>
        </header>

        <div class="mb-6">
            <button
                @click="showModal = true"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
                + Novo Usuário
            </button>
        </div>

        <!-- Users Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <table v-if="users && users.length > 0" class="w-full text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th
                            class="px-4 py-3 text-left font-medium text-gray-600"
                        >
                            Nome
                        </th>
                        <th
                            class="px-4 py-3 text-left font-medium text-gray-600"
                        >
                            Email
                        </th>
                        <th
                            class="px-4 py-3 text-center font-medium text-gray-600"
                        >
                            Admin
                        </th>
                        <th
                            class="px-4 py-3 text-left font-medium text-gray-600"
                        >
                            Criado em
                        </th>
                        <th class="px-4 py-3 w-24"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr
                        v-for="user in users"
                        :key="user.id"
                        class="hover:bg-gray-50"
                    >
                        <td class="px-4 py-3 font-medium">{{ user.name }}</td>
                        <td class="px-4 py-3">{{ user.email }}</td>
                        <td class="px-4 py-3 text-center">
                            <span
                                v-if="user.isAdmin"
                                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                            >
                                Sim
                            </span>
                            <span
                                v-else
                                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                            >
                                Não
                            </span>
                        </td>
                        <td class="px-4 py-3">
                            {{ formatDate(user.createdAt) }}
                        </td>
                        <td class="px-4 py-3 text-right">
                            <button
                                v-if="user.id !== currentUser?.id"
                                @click="deleteUser(user.id)"
                                class="text-red-600 hover:text-red-800"
                            >
                                Excluir
                            </button>
                            <span v-else class="text-gray-400 text-xs">
                                (você)
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-else class="p-8 text-center text-gray-500">
                Nenhum usuário cadastrado
            </div>
        </div>

        <!-- Modal -->
        <div
            v-if="showModal"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            @click.self="showModal = false"
        >
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h2 class="text-xl font-semibold mb-4">Novo Usuário</h2>

                <div
                    v-if="errorMessage"
                    class="mb-4 p-3 bg-red-100 text-red-700 rounded"
                >
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="createUser" class="space-y-4">
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Nome
                        </label>
                        <input
                            v-model="newUser.name"
                            type="text"
                            required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email
                        </label>
                        <input
                            v-model="newUser.email"
                            type="email"
                            required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Senha
                        </label>
                        <input
                            v-model="newUser.password"
                            type="password"
                            required
                            minlength="6"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p class="text-xs text-gray-500 mt-1">
                            Mínimo de 6 caracteres
                        </p>
                    </div>

                    <div class="flex items-center gap-2">
                        <input
                            id="isAdmin"
                            v-model="newUser.isAdmin"
                            type="checkbox"
                            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label for="isAdmin" class="text-sm text-gray-700">
                            Administrador
                        </label>
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
