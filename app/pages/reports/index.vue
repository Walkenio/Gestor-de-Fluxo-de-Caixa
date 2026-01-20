<template>
    <NuxtLayout name="default">
        <template v-slot:headerTitle>Reports</template>
        <template v-slot:headerDescription>Visualize e gere relatórios detalhados do seu fluxo de caixa</template>
        <template v-slot:headerActions>
            <button
                @click.stop.prevent="actionClicked"
                class="bg-accent text-white px-4 py-2.5 rounded-lg font-medium hover:bg-accent-hover transition-colors flex items-center gap-2"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Novo relatório
            </button>
        </template>

        <div>
            <h2 class="text-2xl font-bold text-text-primary">Reports INDEX</h2>
        </div>
    </NuxtLayout>
</template>

<script lang="ts" setup>
function actionClicked() {
    console.log('Action button clicked!');
}
</script>
