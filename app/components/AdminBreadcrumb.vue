<template>
    <!-- breadcrumb -->
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <nav class="flex" aria-label="Breadcrumb">
            <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                <li class="inline-flex items-center">
                    <NuxtLink
                        to="/"
                        class="inline-flex items-center text-md text-body hover:text-fg-brand text-md font-semibold text-text-primary hover:underline"
                    >
                        <svg
                            class="w-4 h-4 me-1.5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
                            />
                        </svg>
                        Home
                    </NuxtLink>
                </li>
                <template v-for="(item, index) in breadcrumbItems" :key="index">
                    <li>
                        <div class="flex items-center space-x-1.5">
                            <svg
                                class="w-3.5 h-3.5 rtl:rotate-180 text-body"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="m9 5 7 7-7 7"
                                />
                            </svg>
                            <NuxtLink
                                :to="item.href"
                                class="inline-flex items-center text-md text-body hover:text-fg-brand text-md font-semibold text-text-primary hover:underline"
                            >
                                {{ item.text }}
                            </NuxtLink>
                        </div>
                    </li>
                </template>
            </ol>
        </nav>
    </div>
</template>

<script setup lang="ts">

const makeBreadcrumbItem = (text: string, href: string|null = null) => ({ text, href });

const breadcrumbItems = computed(() => {
    const items = [
        makeBreadcrumbItem('Fluxo de Caixa', '/cash-flow'),
    ];

    if (cashFlow.value && cashFlow.value.id) {
        items.push({
            text: `${formatMonth(cashFlow.value.month)} ${cashFlow.value.year}`,
            href: `/cash-flow/${cashFlow.value.id}`,
        });
    }

    return items;
});
</script>
