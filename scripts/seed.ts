import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import * as schema from '../server/db/schema';

const ADMIN_USER = {
    name: 'Administrador',
    email: 'admin@admin.com',
    password: 'admin123',
    isAdmin: true,
};

async function seed() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('DATABASE_URL não definida no ambiente');
        process.exit(1);
    }

    console.log('Conectando ao banco de dados...');
    const client = postgres(connectionString);
    const db = drizzle(client, { schema });

    try {
        console.log(`Verificando usuário: ${ADMIN_USER.email}`);

        const existingUser = await db.query.users.findFirst({
            where: eq(schema.users.email, ADMIN_USER.email),
        });

        const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);

        if (existingUser) {
            console.log('Usuário encontrado. Atualizando...');
            await db
                .update(schema.users)
                .set({
                    name: ADMIN_USER.name,
                    password: hashedPassword,
                    isAdmin: ADMIN_USER.isAdmin,
                })
                .where(eq(schema.users.email, ADMIN_USER.email));
            console.log('Usuário atualizado com sucesso!');
        } else {
            console.log('Usuário não encontrado. Criando...');
            await db.insert(schema.users).values({
                name: ADMIN_USER.name,
                email: ADMIN_USER.email,
                password: hashedPassword,
                isAdmin: ADMIN_USER.isAdmin,
            });
            console.log('Usuário criado com sucesso!');
        }

        console.log('\n========================================');
        console.log('Credenciais do usuário admin:');
        console.log(`Email: ${ADMIN_USER.email}`);
        console.log(`Senha: ${ADMIN_USER.password}`);
        console.log('========================================\n');
    } catch (error) {
        console.error('Erro ao executar seed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seed();
