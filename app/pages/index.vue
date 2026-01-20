<template>
    <NuxtLayout name="default">
        <div class="w-full flex flex-col gap-4">
            <!-- Cards Grid -->
            <div v-if="(statsCards || [])?.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <NuxtLink
                    v-for="(card, index) in statsCards"
                    :key="index"
                    class="bg-bg-card border border-border rounded-xl p-6 hover:border-accent/50 hover:bg-bg-card-hover transition-all group"
                    :class="card.bgColor"
                    :to="card.link || '#'"
                >
                    <div class="w-full flex items-baseline-last gap-4">
                        <h2 class="text-xl font-semibold text-text-primary group-hover:text-white">
                            {{ card.title }}
                        </h2>

                        <div class="ml-auto">
                            <svg
                                class="w-6 h-6 text-white/70 group-hover:text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                    </div>
                </NuxtLink>
            </div>
        </div>
    </NuxtLayout>
</template>

<script setup lang="ts">
const { user, logout } = useAuth();

const userPermissions = computed(() => {
    return user.value?.permissions || [];
});

const statsCardsData = ref([
    {
        title: 'Cash Flow',
        link: '/cash-flow',
        class: 'bg-gradient-to-r from-green-400 to-blue-500',
        show: () => true,
    },
    {
        title: 'Users',
        link: '/users',
        class: 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500',
        show: () => user.value?.isAdmin === true,
    },
    {
        title: 'Reports',
        link: '/reports',
        class: 'bg-gradient-to-r from-yellow-400 to-red-500',
        show: () => userPermissions.value.includes('view_reports'),
    },
]);

const statsCards = computed(() =>
    statsCardsData.value.filter((card) => {
        try {
            if (card.show == null) {
                return true;
            }

            if (typeof card.show !== 'function') {
                return true;
            }

            return card.show();
        } catch (error) {
            console.error('Error evaluating card show condition:', error);
            return false;
        }
    })
);
</script>
