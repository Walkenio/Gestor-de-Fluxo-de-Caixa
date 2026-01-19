import { getUserSession } from '../../utils/session';

export default defineEventHandler(async (event) => {
    const session = getUserSession(event);

    if (!session) {
        throw createError({
            statusCode: 401,
            message: 'Não autorizado',
        });
    }

    return {
        user: {
            id: session.userId,
            name: session.name,
            email: session.email,
            isAdmin: session.isAdmin,
        },
    };
});
