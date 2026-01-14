<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useSupportStore } from '@/stores/support';
import { useLoadingStore } from '@/stores/loading';
import { AuthService } from '@/service/AuthService';
import AppBreadcrumb from './AppBreadcrumb.vue';
import { RouterLink } from 'vue-router';
import SupportButton from '@/components/topbar/SupportButton.vue';

const { layoutState, isDarkTheme, toggleMenu, toggleConfigSidebar } = useLayout();

const authStore = useAuthStore();
const supportStore = useSupportStore();
const loadingStore = useLoadingStore();

const notificationsBars = [
    {
        id: 'inbox',
        label: 'Inbox',
        badge: '2'
    },
    {
        id: 'general',
        label: 'General'
    },
    {
        id: 'archived',
        label: 'Archived'
    }
];

const selectedNotificationBar = ref(notificationsBars?.[0].id ?? 'inbox');
const notificationSearch = ref('');
const notifications = [
    {
        id: 'inbox',
        data: [
            {
                image: '/demo/images/avatar/avatar-square-m-2.jpg',
                name: 'Michael Lee',
                description: 'You have a new message from the support team regarding your recent inquiry.',
                time: '1 hour ago',
                attachment: {
                    title: 'Contract',
                    size: '2.1 MB'
                },
                read: false
            },
            {
                image: '/demo/images/avatar/avatar-square-f-1.jpg',
                name: 'Alice Johnson',
                description: 'Your report has been successfully submitted and is under review.',
                time: '10 minutes ago',
                read: true
            },
            {
                image: '/demo/images/avatar/avatar-square-f-2.jpg',
                name: 'Emily Davis',
                description: 'The project deadline has been updated to September 30th. Please check the details.',
                time: 'Yesterday at 4:35 PM',
                read: false
            }
        ]
    },
    {
        id: 'general',
        data: [
            {
                image: '/demo/images/avatar/avatar-square-f-1.jpg',
                name: 'Alice Johnson',
                description: 'Reminder: Your subscription is about to expire in 3 days. Renew now to avoid interruption.',
                time: '30 minutes ago',
                read: true
            },
            {
                image: '/demo/images/avatar/avatar-square-m-2.jpg',
                name: 'Michael Lee',
                description: 'The server maintenance has been completed successfully. No further downtime is expected.',
                time: 'Yesterday at 2:15 PM',
                read: false
            }
        ]
    },
    {
        id: 'archived',
        data: [
            {
                image: '/demo/images/avatar/avatar-square-m-1.jpg',
                name: 'Lucas Brown',
                description: 'Your appointment with Dr. Anderson has been confirmed for October 12th at 10:00 AM.',
                time: '1 week ago',
                read: false
            },
            {
                image: '/demo/images/avatar/avatar-square-f-2.jpg',
                name: 'Emily Davis',
                description: 'The document you uploaded has been successfully archived for future reference.',
                time: '2 weeks ago',
                read: true
            }
        ]
    }
];

function toggleSearchBar() {
    layoutState.searchBarActive = !layoutState.searchBarActive;
}

function showRightMenu() {
    layoutState.rightMenuVisible = !layoutState.rightMenuVisible;
}

const logout = async () => {
    loadingStore.enable();

    try {
        await AuthService.logout();

        authStore.logout();
    } catch {
        // empty catch
    }

    loadingStore.disable();
};
</script>

<template>
    <div class="layout-topbar">
        <div class="topbar-left">
            <a tabindex="0" class="menu-button" @click="toggleMenu">
                <i class="pi pi-chevron-left" />
            </a>
            <img class="horizontal-logo" src="/layout/images/logo-white.svg" alt="poseidon-layout" />
            <span class="topbar-separator" />
            <AppBreadcrumb />
            <!-- <router-link to="/"><img class="mobile-logo" :src="`/layout/images/logo-${isDarkTheme ? 'white' : 'dark'}.svg`" alt="poseidon-layout" /></router-link> -->
            <router-link to="/"><img class="mobile-logo" :src="'/layout/images/logo-fetlpa.webp'" alt="FETLPA" /></router-link>
        </div>

        <div class="topbar-right">
            <ul class="topbar-menu">
                <li v-if="authStore.user?.can_view_support" class="right-sidebar-item">
                    <SupportButton />
                </li>

                <!-- <li class="right-sidebar-item">
                    <a class="right-sidebar-button" @click="toggleSearchBar">
                        <i class="pi pi-search" />
                    </a>
                </li> -->

                <!-- <li class="right-sidebar-item">
                    <button type="button" class="app-config-button" @click="toggleConfigSidebar" aria-label="Toggle Config Sidebar">
                        <i class="pi pi-cog" />
                    </button>
                </li> -->

                <!-- <li class="right-sidebar-item">
                    <router-link to="/configuration">
                        <i class="pi pi-cog" />
                    </router-link>
                </li> -->

                <!-- <li class="right-sidebar-item static sm:relative">
                    <a
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveActiveClass: 'animate-fadeout', leaveToClass: 'hidden', hideOnOutsideClick: true }"
                        class="right-sidebar-button relative z-50"
                    >
                        <span class="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2.5" />
                        <i class="pi pi-bell" />
                    </a>
                    <div
                        class="list-none m-0 py-4 px-4 rounded-3xl border border-surface absolute bg-surface-0 dark:bg-surface-900 overflow-hidden hidden origin-top min-w-72 sm:w-[24rem] mt-2 right-0 z-50 top-auto shadow-[0px_56px_16px_0px_rgba(0,0,0,0.00),0px_36px_14px_0px_rgba(0,0,0,0.01),0px_20px_12px_0px_rgba(0,0,0,0.02),0px_9px_9px_0px_rgba(0,0,0,0.03),0px_2px_5px_0px_rgba(0,0,0,0.04)]"
                    >
                        <div class="flex items-center gap-2 justify-between">
                            <span class="text-lg font-medium text-surface-950 dark:text-surface-0">Notifications</span>
                            <button class="text-surface-700 dark:text-surface-300 text-sm font-medium">Mark all as read</button>
                        </div>
                        <div class="my-2 shadow-custom-shadow border border-surface-200 dark:border-surface-800 bg-white/55 dark:bg-white/8 flex items-center gap-2 rounded-full p-1">
                            <button
                                v-for="(item, index) of notifications"
                                :key="index"
                                class="rounded-full p-2 flex-1 flex items-center justify-center transition-all"
                                :class="selectedNotificationBar === item.id ? 'bg-primary-100 dark:bg-primary-900' : 'hover:bg-primary-100/30 dark:hover:bg-primary-900/30'"
                                @click="selectedNotificationBar = item.id"
                            >
                                <span class="capitalize font-medium text-surface-950 dark:text-surface-0">{{ item.id }}</span>
                            </button>
                        </div>
                        <div class="mt-4 mb-8">
                            <IconField>
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="notificationSearch" placeholder="Search" class="!w-full" />
                            </IconField>
                        </div>
                        <ul class="flex flex-col gap-8">
                            <li v-for="(item, index) of notifications.find((item) => item.id === selectedNotificationBar).data" :key="index" class="flex gap-3">
                                <div class="flex flex-col items-center gap-1">
                                    <OverlayBadge severity="danger" class="inline-flex">
                                        <Avatar :image="item.image" class="!w-10 !h-10" shape="circle" />
                                    </OverlayBadge>
                                    <span class="flex-1 w-px bg-surface-200 dark:bg-surface-800" />
                                </div>
                                <div class="flex-1 pt-2 space-y-2">
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="font-medium text-surface-950 dark:text-surface-0">{{ item.name }}</span>
                                        <div class="text-sm text-surface-700 dark:text-surface-200 flex items-center gap-1">
                                            {{ item.time }}
                                            <div v-if="!item.read" class="!w-2 !h-2 rounded-full bg-green-500" />
                                        </div>
                                    </div>
                                    <div class="p-2 bg-surface-100 dark:bg-surface-800 border border-surface rounded-lg">
                                        <p class="text-sm text-surface-700 dark:text-surface-200 line-clamp-2 text-ellipsis">
                                            {{ item.description }}
                                        </p>
                                    </div>
                                    <div v-if="item.attachment" class="p-2 bg-surface-100 dark:bg-surface-800 border border-surface rounded-lg flex items-start gap-3">
                                        <div class="w-8 h-8 flex items-center justify-center rounded-md shadow-sm bg-surface-0 dark:bg-surface-950">
                                            <i class="pi pi-file-pdf text-primary" />
                                        </div>
                                        <div class="flex-1 flex flex-col gap-0.5">
                                            <span class="text-sm font-medium text-surface-700 dark:text-surface-200">{{ item.attachment.title }}</span>
                                            <span class="text-xs text-surface-700 dark:text-surface-200">{{ item.attachment.size }}</span>
                                        </div>
                                        <Button icon="pi pi-download" severity="contrast" class="!w-8 !h-8 !p-0" />
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </li> -->

                <li class="profile-item static sm:relative">
                    <a
                        class="!bg-none !border-none !outline-none"
                        v-styleclass="{ selector: '.profile-menu', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveActiveClass: 'animate-fadeout', leaveToClass: 'hidden', hideOnOutsideClick: true }"
                    >
                        <Avatar
                            :image="authStore.user?.image ? `${authStore.assetsBaseUrl}${authStore.user?.image}` : null"
                            :label="!authStore.user?.image ? `${authStore.user?.firstname?.charAt(0).toUpperCase()}${authStore.user?.lastname?.charAt(0).toUpperCase()}` : null"
                            shape="circle"
                            pt:image:class="!rounded-lg"
                            class="!w-10 !h-10"
                        />
                    </a>
                    <div
                        class="profile-menu list-none p-2 m-0 rounded-2xl border border-surface overflow-hidden absolute bg-surface-0 dark:bg-surface-900 hidden origin-top w-52 mt-2 right-0 z-[999] top-auto shadow-[0px_56px_16px_0px_rgba(0,0,0,0.00),0px_36px_14px_0px_rgba(0,0,0,0.01),0px_20px_12px_0px_rgba(0,0,0,0.02),0px_9px_9px_0px_rgba(0,0,0,0.03),0px_2px_5px_0px_rgba(0,0,0,0.04)]"
                    >
                        <ul class="flex flex-col gap-1">
                            <li>
                                <router-link
                                    to="/profile"
                                    v-styleclass="{ selector: '.profile-menu', leaveActiveClass: 'animate-fadeout', leaveToClass: 'hidden' }"
                                    class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis transition-colors duration-150 cursor-pointer"
                                >
                                    <i class="pi pi-user" />
                                    <span>Profile</span>
                                </router-link>
                            </li>
                            <li>
                                <a class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis transition-colors duration-150 cursor-pointer">
                                    <i class="pi pi-cog" />
                                    <span>Settings</span>
                                </a>
                            </li>

                            <!-- <li>
                                <a class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis transition-colors duration-150 cursor-pointer">
                                    <i class="pi pi-calendar" />
                                    <span>Calendar</span>
                                </a>
                            </li> -->

                            <!-- <li>
                                <a class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis transition-colors duration-150 cursor-pointer">
                                    <i class="pi pi-inbox" />
                                    <span>Inbox</span>
                                </a>
                            </li> -->

                            <li>
                                <a
                                    class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis transition-colors duration-150 cursor-pointer"
                                    v-styleclass="{ selector: '.profile-menu', leaveActiveClass: 'animate-fadeout', leaveToClass: 'hidden' }"
                                    @click="logout"
                                >
                                    <i class="pi pi-power-off" />
                                    <span>Log out</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>

                <!-- <li class="right-sidebar-item">
                    <a tabindex="0" class="right-sidebar-button" @click="showRightMenu">
                        <i class="pi pi-align-right" />
                    </a>
                </li> -->
            </ul>
        </div>
    </div>
</template>
