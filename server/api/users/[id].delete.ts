import { useDb } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../utils/session';

export default defineEventHandler(async (event) => {
    const session = requireAuth(event);
    const id = parseInt(getRouterParam(event, 'id') || '');

    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'ID inválido',
        });
    }

    if (session.userId === id) {
        throw createError({
            statusCode: 400,
            message: 'Você não pode excluir seu próprio usuário',
        });
    }

    const db = useDb();

    const existing = await db.query.users.findFirst({
        where: eq(users.id, id),
    });

    if (!existing) {
        throw createError({
            statusCode: 404,
            message: 'Usuário não encontrado',
        });
    }

    await db.delete(users).where(eq(users.id, id));

    return { success: true, message: 'Usuário removido com sucesso' };
});
