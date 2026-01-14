<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppMenu from './AppMenu.vue';
import AppTopbar from './AppTopbar.vue';

const { layoutConfig, layoutState, isHorizontal } = useLayout();

let timeout = null;

function onMouseEnter() {
    if (!layoutState.anchored) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        layoutState.sidebarActive = true;
    }
}

function onMouseLeave() {
    if (!layoutState.anchored) {
        if (!timeout) {
            timeout = setTimeout(() => (layoutState.sidebarActive = false), 300);
        }
    }
}

function onAnchorToggle() {
    layoutState.anchored = !layoutState.anchored;
}
</script>

<template>
    <div class="layout-sidebar" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <div class="sidebar-header">
            <router-link to="/" class="logo">
                <img class="logo-image" :src="'/layout/images/logo-fetlpa.webp'" alt="FETLPA" />
                <!-- <img class="logo-image" :src="!layoutConfig.darkTheme ? '/layout/images/logo-dark.svg' : '/layout/images/logo-white.svg'" alt="poseidon-layout" /> -->
                <span class="app-name text-4xl font-medium leading-normal">FETLPA</span>
            </router-link>
            <button class="layout-sidebar-anchor" type="button" @click="onAnchorToggle" />
        </div>
        <div class="layout-menu-container">
            <AppMenu />
        </div>
        <AppTopbar v-if="isHorizontal" />
    </div>
</template>
