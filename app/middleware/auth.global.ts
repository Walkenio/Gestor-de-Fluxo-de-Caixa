export default defineNuxtRouteMiddleware(async (to) => {
    const { user, fetchUser } = useAuth();

    // Rotas públicas
    if (to.path === '/login') {
        // Se já está logado, redireciona para home
        if (!user.value) {
            await fetchUser();
        }
        if (user.value) {
            return navigateTo('/');
        }
        return;
    }

    // Para todas as outras rotas, verifica autenticação
    if (!user.value) {
        await fetchUser();
    }

    if (!user.value) {
        return navigateTo('/login');
    }
});
