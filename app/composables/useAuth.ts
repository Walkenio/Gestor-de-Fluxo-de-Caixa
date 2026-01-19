interface User {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
}

export const useAuth = () => {
    const user = useState<User | null>('auth-user', () => null);
    const isAuthenticated = computed(() => !!user.value);

    async function fetchUser() {
        try {
            const { user: userData } = await $fetch<{ user: User }>(
                '/api/auth/me'
            );
            user.value = userData;
            return userData;
        } catch {
            user.value = null;
            return null;
        }
    }

    async function login(email: string, password: string) {
        const { user: userData } = await $fetch<{ user: User }>(
            '/api/auth/login',
            {
                method: 'POST',
                body: { email, password },
            }
        );
        user.value = userData;
        return userData;
    }

    async function logout() {
        await $fetch('/api/auth/logout', { method: 'POST' });
        user.value = null;
        await navigateTo('/login');
    }

    return {
        user,
        isAuthenticated,
        fetchUser,
        login,
        logout,
    };
};
