<script setup lang="ts">
useHead({
    meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    link: [{ rel: 'icon', href: '/favicon.ico' }],
    htmlAttrs: {
        lang: 'pt-BR',
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
    <div class="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <NuxtPage />
    </div>
</template>
