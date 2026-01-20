interface User {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
}

export const commonPermissions = ['view_reports', 'edit_profile'];

export const useAuth = () => {
    const user = useState<User | null>('auth-user', () => null);
    const isAuthenticated = computed(() => !!user.value);
    const permissions = computed(() => {
        return user.value?.permissions || [];
    });


    async function fetchUser() {
        try {
            const { user: userData } = await $fetch<{ user: User }>('/api/auth/me');
            let _permissions = userData.permissions || [];
            user.value = {
                ...userData,
                permissions: [...new Set([..._permissions, ...commonPermissions])],
            };
            return userData;
        } catch {
            user.value = null;
            return null;
        }
    }

    async function login(email: string, password: string) {
        const { user: userData } = await $fetch<{ user: User }>('/api/auth/login', {
            method: 'POST',
            body: { email, password },
        });

        let _permissions = userData.permissions || [];

        user.value = {
            ...userData,
            permissions: [...new Set([..._permissions, ...commonPermissions])],
        };
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
