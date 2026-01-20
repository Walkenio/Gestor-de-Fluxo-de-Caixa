<script setup lang="ts">
const layoutCustomProps = useAttrs();

console.log(layoutCustomProps);
</script>

<template>
    <div class="min-h-screen bg-bg-primary text-text-primary antialiased">
        <template v-if="$slots.header">
            <slot name="header" />
        </template>
        <header v-else class="p-4 bg-white shadow">
            <h1 class="text-2xl font-bold">{{ layoutCustomProps?.title || '' }}</h1>
        </header>

        <main class="p-4">
            <slot />
        </main>
    </div>
</template>
