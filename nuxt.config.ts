import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2026-01-15',
    devtools: {
        enabled: true,
    },
    vite: {
        plugins: [tailwindcss()],
    },
    css: ['./app/assets/css/main.css'],
    runtimeConfig: {
        databaseUrl: process.env.DATABASE_URL,
        sessionSecret:
            process.env.SESSION_SECRET || 'sua-chave-secreta-aqui-mude-em-producao',
    },
});
