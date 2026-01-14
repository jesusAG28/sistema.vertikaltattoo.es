<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { RouterLink } from 'vue-router';

const route = useRoute();
const breadcrumbRoutes = ref([]);

const setBreadcrumbRoutes = () => {
    if (route.meta.breadcrumb) {
        breadcrumbRoutes.value = route.meta.breadcrumb;

        return;
    }

    breadcrumbRoutes.value = route.fullPath
        .split('/')
        .filter((item) => item !== '')
        .filter((item) => isNaN(Number(item)))
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1));
};

watch(
    route,
    () => {
        setBreadcrumbRoutes();
    },
    { immediate: true }
);
</script>

<template>
    <nav class="layout-breadcrumb">
        <ol>
            <li class="font-medium text-surface-950 dark:text-surface-0 text-xl">
                <router-link v-if="route.path !== '/'" to="/">
                    <i class="pi pi-home" />
                </router-link>
                <i v-else class="pi pi-home" />
            </li>
            <li v-if="route.path !== '/'" class="layout-breadcrumb-chevron">/</li>
            <template v-for="(breadcrumbRoute, i) in breadcrumbRoutes" :key="breadcrumbRoute">
                <li class="font-medium text-surface-950 dark:text-surface-0 text-xl">
                    <router-link v-if="breadcrumbRoute.to && (breadcrumbRoute.label || breadcrumbRoute.translatable)" :to="breadcrumbRoute.to">
                        {{ breadcrumbRoute.translatable ? $t(breadcrumbRoute.translatable) : breadcrumbRoute.label }}
                    </router-link>
                    <template v-else>{{ breadcrumbRoute.translatable ? $t(breadcrumbRoute.translatable) : breadcrumbRoute }}</template>
                </li>
                <li v-if="i !== breadcrumbRoutes.length - 1" class="layout-breadcrumb-chevron">/</li>
            </template>
        </ol>
    </nav>
</template>
