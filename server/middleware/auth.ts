import { getUserSession } from '../utils/session';

export default defineEventHandler((event) => {
    const path = getRequestURL(event).pathname;

    // Rotas públicas (não precisam de autenticação)
    const publicRoutes = ['/api/auth/login', '/api/auth/logout'];

    if (publicRoutes.includes(path)) {
        return;
    }

    // Proteger todas as rotas de API exceto auth
    if (path.startsWith('/api/') && !path.startsWith('/api/auth/')) {
        const session = getUserSession(event);
        if (!session) {
            throw createError({
                statusCode: 401,
                message: 'Não autorizado',
            });
        }
    }
});
