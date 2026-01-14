<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import AppBreadcrumb from './AppBreadcrumb.vue';
import AppConfig from './AppConfig.vue';
import AppFooter from './AppFooter.vue';
import AppRightMenu from './AppRightMenu.vue';
import AppSearch from './AppSearch.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';
import AppLoading from './AppLoading.vue';
import ConnectionIndicator from '@/components/PWA/ConnectionIndicator.vue';
import { useSupportPolling } from '@/composables/useSupportPolling';

const { layoutConfig, layoutState, isSidebarActive } = useLayout();
const outsideClickListener = ref(null);

// Iniciar polling de tickets de soporte
useSupportPolling(5); // Cada 5 minutos

watch(isSidebarActive, (newVal) => {
    if (newVal) {
        bindOutsideClickListener();
    } else {
        unbindOutsideClickListener();
    }
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const containerClass = computed(() => {
    return [
        {
            'layout-overlay': layoutConfig.menuMode === 'overlay',
            'layout-static': layoutConfig.menuMode === 'static',
            'layout-slim': layoutConfig.menuMode === 'slim',
            'layout-horizontal': layoutConfig.menuMode === 'horizontal',
            'layout-compact': layoutConfig.menuMode === 'compact',
            'layout-reveal': layoutConfig.menuMode === 'reveal',
            'layout-drawer': layoutConfig.menuMode === 'drawer',
            'layout-overlay-active': layoutState.overlayMenuActive || layoutState.staticMenuMobileActive,
            'layout-mobile-active': layoutState.staticMenuMobileActive,
            'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
            'layout-sidebar-active': layoutState.sidebarActive,
            'layout-sidebar-anchored': layoutState.anchored
        }
    ];
});

function bindOutsideClickListener() {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                layoutState.overlayMenuActive = false;
                layoutState.overlaySubmenuActive = false;
                layoutState.staticMenuMobileActive = false;
                layoutState.menuHoverActive = false;
                layoutState.configSidebarVisible = false;
            }
        };

        setTimeout(() => {
            document.addEventListener('click', outsideClickListener.value);
        }, 0);
    }
}

function unbindOutsideClickListener() {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener.value);
        outsideClickListener.value = null;
    }
}

function isOutsideClicked(event) {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarButtonEl = document.querySelector('.topbar-left > a');

    return !(sidebarEl?.isSameNode(event.target) || sidebarEl?.contains(event.target) || topbarButtonEl?.isSameNode(event.target) || topbarButtonEl?.contains(event.target));
}
</script>

<template>
    <div class="layout-wrapper" :class="containerClass">
        <ConnectionIndicator />
        <img class="absolute w-[144px] h-auto top-0 left-0 mix-blend-color-dodge pointer-events-none hidden dark:block" src="/images/app-light-1.png" alt="App Light" />
        <img class="absolute w-[766px] h-auto top-0 right-0 mix-blend-color-dodge pointer-events-none hidden dark:block" src="/images/app-light-2.png" alt="App Light" />
        <img class="absolute w-[327px] h-auto bottom-0 left-52 mix-blend-color-dodge pointer-events-none hidden dark:block" src="/images/app-light-3.png" alt="App Light" />
        <AppSidebar ref="sidebarRef" />
        <div class="layout-content-wrapper">
            <div class="layout-content-wrapper-inside">
                <AppTopbar />
                <div class="layout-content">
                    <AppBreadcrumb />
                    <router-view />
                </div>
                <AppFooter />
            </div>
        </div>
        <AppConfig />
        <AppSearch />
        <AppRightMenu />
        <Toast />
        <div class="layout-mask" />
        <AppLoading />
    </div>
</template>
