import { useDb } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { requireAdmin } from '../../utils/session';

interface CreateUserBody {
    name: string;
    email: string;
    password: string;
    isAdmin?: boolean;
}

export default defineEventHandler(async (event) => {
    requireAdmin(event);

    const body = await readBody<CreateUserBody>(event);

    if (!body.name || !body.email || !body.password) {
        throw createError({
            statusCode: 400,
            message: 'Nome, email e senha são obrigatórios',
        });
    }

    if (body.password.length < 6) {
        throw createError({
            statusCode: 400,
            message: 'A senha deve ter pelo menos 6 caracteres',
        });
    }

    const db = useDb();

    const existing = await db.query.users.findFirst({
        where: eq(users.email, body.email.toLowerCase()),
    });

    if (existing) {
        throw createError({
            statusCode: 409,
            message: 'Este email já está em uso',
        });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const [newUser] = await db
        .insert(users)
        .values({
            name: body.name,
            email: body.email.toLowerCase(),
            password: hashedPassword,
            isAdmin: body.isAdmin || false,
        })
        .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            isAdmin: users.isAdmin,
            createdAt: users.createdAt,
        });

    return newUser;
});
