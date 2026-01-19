<script setup lang="ts">
useHead({
    meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0a0a0f' },
    ],
    link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: '',
        },
        {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
    ],
    htmlAttrs: {
        lang: 'pt-BR',
        class: 'dark',
    },
});

const title = 'Fluxo de Caixa - Controle Financeiro Mensal';
const description =
    'Sistema de controle de fluxo de caixa mensal com registro de entradas e saídas.';

useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
});
</script>

<template>
    <div class="min-h-screen bg-bg-primary text-text-primary antialiased">
        <NuxtPage />
    </div>
</template>
