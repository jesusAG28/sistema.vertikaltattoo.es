<script setup>
import AppFooter from './AppFooter.vue';

// const { toggleConfigSidebar } = useLayout();
</script>

<template>
    <div class="w-full min-h-screen">
        <!-- <TopbarWidget /> -->
        <main>
            <router-view />
        </main>
        <AppFooter />
        <!-- <FooterWidget /> -->
        <!-- <button class="layout-config-button config-link" @click="toggleConfigSidebar">
            <i class="pi pi-cog" />
        </button>
        <AppConfig location="landing" /> -->
    </div>
</template>
