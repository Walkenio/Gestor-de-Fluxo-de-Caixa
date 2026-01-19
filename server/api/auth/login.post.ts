import { useDb } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { setUserSession } from '../../utils/session';

interface LoginBody {
    email: string;
    password: string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<LoginBody>(event);

    if (!body.email || !body.password) {
        throw createError({
            statusCode: 400,
            message: 'Email e senha são obrigatórios',
        });
    }

    const db = useDb();
    const user = await db.query.users.findFirst({
        where: eq(users.email, body.email.toLowerCase()),
    });

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Email ou senha inválidos',
        });
    }

    const validPassword = await bcrypt.compare(body.password, user.password);
    if (!validPassword) {
        throw createError({
            statusCode: 401,
            message: 'Email ou senha inválidos',
        });
    }

    setUserSession(event, {
        userId: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
    });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        },
    };
});
