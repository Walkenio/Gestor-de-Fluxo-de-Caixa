<template>
    <NuxtLayout name="default">
        <template v-slot:headerTitle>Page Title</template>
        <template v-slot:headerDescription>
            Description text goes here to describe the page content
        </template>
        <template v-slot:headerActions>
            <button
                @click.stop.prevent="actionClicked"
                class="bg-accent text-white px-4 py-2.5 rounded-lg font-medium hover:bg-accent-hover transition-colors flex items-center gap-2"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Action
            </button>
        </template>

        <!-- content here -->
    </NuxtLayout>
</template>

<script lang="ts" setup>
function actionClicked() {
    console.log('Action button clicked!');
}
</script>
