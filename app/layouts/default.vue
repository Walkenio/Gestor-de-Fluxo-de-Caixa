<template>
    <div class="min-h-screen bg-bg-primary md:pt-16">
        <nav class="fixed w-full z-20 top-0 start-0 border-b border-default border-border bg-bg-secondary">
            <div class="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4">
                <NuxtLink to="/" class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                        <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h1 class="text-xl font-semibold text-text-primary">
                        Fluxo de Caixa
                        <span
                            v-if="user?.isAdmin"
                            class="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium text-white"
                            style="background-color: rgb(236, 72, 153)"
                        >
                            Admin
                        </span>
                    </h1>
                </NuxtLink>
                <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                    <div class="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                        <button
                            type="button"
                            class="flex text-sm bg-neutral-primary rounded-full md:me-0 focus:ring-4 focus:ring-neutral-tertiary cursor-pointer"
                            id="user-menu-button"
                            @click.stop.prevent="showUserMenu = !showUserMenu"
                            :aria-expanded="showUserMenu"
                            :aria-hidden="!showUserMenu"
                        >
                            <span class="sr-only">Open user menu</span>
                            <img
                                class="w-8 h-8 rounded-full"
                                src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                                alt="user photo"
                            />
                        </button>
                        <!-- backdrop para quando clicar ocultar menu -->
                        <div
                            v-if="showUserMenu"
                            @click.stop.prevent="showUserMenu = false"
                            class="fixed inset-0 w-full h-full z-40"
                        ></div>
                        <!-- Dropdown menu -->
                        <div
                            class="z-50 bg-bg-secondary border border-gray-700 rounded-base shadow-lg w-44 rounded-lg"
                            :class="{ hidden: !showUserMenu, block: showUserMenu }"
                            :style="{ position: 'absolute', margin: '0px', transform: 'translate3d(-8rem, 9rem, 0px)' }"
                        >
                            <div class="px-4 py-3 text-sm border-b border-gray-700 flex flex-col gap-1.5">
                                <span class="block text-heading font-medium">{{ user?.name }}</span>
                                <span class="block text-body truncate">{{ user?.email }}</span>

                                <span
                                    v-if="user?.isAdmin"
                                    class="w-full block items-center px-2 py-0.5 rounded-lg text-xs font-medium text-white"
                                    style="background-color: rgb(236, 72, 153)"
                                >
                                    Admin
                                </span>
                            </div>
                            <ul class="p-2 text-sm text-body font-medium" aria-labelledby="user-menu-button">
                                <li>
                                    <NuxtLink
                                        to="#"
                                        class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded hover:bg-gray-800"
                                    >
                                        Dashboard
                                    </NuxtLink>
                                </li>
                                <li>
                                    <NuxtLink
                                        to="#"
                                        class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded hover:bg-gray-800"
                                    >
                                        Settings
                                    </NuxtLink>
                                </li>
                                <li>
                                    <NuxtLink
                                        to="#"
                                        class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded hover:bg-gray-800"
                                    >
                                        Earnings
                                    </NuxtLink>
                                </li>
                                <li>
                                    <button
                                        @click.stop.prevent="logout"
                                        class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded hover:bg-red-100/80"
                                        :class="'text-danger hover:text-red-600 text-sm transition-colors'"
                                    >
                                        Sign out
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <button
                            data-collapse-toggle="navbar-user"
                            type="button"
                            class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-body rounded-base md:hidden hover:bg-neutral-secondary-soft hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary"
                            aria-controls="navbar-user"
                            aria-expanded="false"
                        >
                            <span class="sr-only">Open main menu</span>
                            <svg
                                class="w-6 h-6"
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
                                    stroke-width="2"
                                    d="M5 7h14M5 12h14M5 17h14"
                                />
                            </svg>
                        </button>
                    </div>
                    <button
                        data-collapse-toggle="navbar-sticky"
                        type="button"
                        class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-body rounded-base md:hidden hover:bg-neutral-secondary-soft hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary"
                        aria-controls="navbar-sticky"
                        aria-expanded="false"
                    >
                        <span class="sr-only">Open main menu</span>
                        <svg
                            class="w-6 h-6"
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
                                stroke-width="2"
                                d="M5 7h14M5 12h14M5 17h14"
                            />
                        </svg>
                    </button>
                </div>
                <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
                    <ul
                        class="flex flex-col p-4 md:p-0 mt-4 font-medium border border-default rounded-base bg-neutral-secondary-soft md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-neutral-primary"
                    >
                        <li>
                            <NuxtLink
                                to="/"
                                class="block py-2 px-3 text-white bg-brand rounded-sm md:bg-transparent md:text-fg-brand md:p-0"
                                aria-current="page"
                            >
                                Home
                            </NuxtLink>
                        </li>
                        <li v-if="user?.isAdmin">
                            <NuxtLink
                                to="/users"
                                class="block py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent"
                            >
                                Users
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink
                                to="/cash-flow"
                                class="block py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent"
                            >
                                Cash Flow
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink
                                to="/reports"
                                class="block py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent"
                            >
                                Reports
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <div v-if="$slots.header || $slots.headerTitle || $slots.headerActions" class="max-w-7xl mx-auto px-2 p-1 flex items-center justify-between align-center py-4">
            <template v-if="!$slots.headerActions && $slots.header">
                <div class="w-full flex items-center justify-between align-center gap-4">
                    <slot name="header" />
                </div>
            </template>
            <div v-else class="w-full flex items-center justify-between align-center gap-4">
                <div class="w-full md:w-6/12">
                    <h2 data-slot-name="headerTitle" class="text-2xl font-bold text-text-primary"><slot name="headerTitle" /></h2>
                    <p data-slot-name="headerDescription" class="mt-1 text-text-secondary"><slot name="headerDescription" /></p>
                </div>
                <div data-slot-name="headerActions" class="w-full md:w-6/12 flex justify-end items-center gap-4">
                    <slot name="headerActions" />
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-6 py-8" data-template-file="default">
            <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth();
const defaultLayoutProps = useAttrs();

console.log(defaultLayoutProps);

const showUserMenu = ref(false);
</script>
