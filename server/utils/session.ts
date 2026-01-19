import { H3Event } from 'h3';

const SESSION_COOKIE_NAME = 'auth_session';

export interface SessionData {
    userId: number;
    email: string;
    name: string;
    isAdmin: boolean;
}

export function setUserSession(event: H3Event, user: SessionData) {
    const config = useRuntimeConfig();
    const sessionData = JSON.stringify(user);
    const encoded = Buffer.from(sessionData).toString('base64');

    setCookie(event, SESSION_COOKIE_NAME, encoded, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: '/',
    });
}

export function getUserSession(event: H3Event): SessionData | null {
    const cookie = getCookie(event, SESSION_COOKIE_NAME);
    if (!cookie) return null;

    try {
        const decoded = Buffer.from(cookie, 'base64').toString('utf-8');
        return JSON.parse(decoded) as SessionData;
    } catch {
        return null;
    }
}

export function clearUserSession(event: H3Event) {
    deleteCookie(event, SESSION_COOKIE_NAME, {
        path: '/',
    });
}

export function requireAuth(event: H3Event): SessionData {
    const session = getUserSession(event);
    if (!session) {
        throw createError({
            statusCode: 401,
            message: 'Não autorizado',
        });
    }
    return session;
}

export function requireAdmin(event: H3Event): SessionData {
    const session = requireAuth(event);
    if (!session.isAdmin) {
        throw createError({
            statusCode: 403,
            message: 'Acesso negado',
        });
    }
    return session;
}
