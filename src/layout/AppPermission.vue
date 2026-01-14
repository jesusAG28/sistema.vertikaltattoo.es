<script setup>
import { ref, onBeforeMount } from 'vue';
import { AuthService } from '@/service/AuthService';
import AppProgressSpinner from './AppProgressSpinner.vue';
import AppAccessDenied from './AppAccessDenied.vue';
import AppOops from './AppOops.vue';

onBeforeMount(async () => {
    can(props.permission);
});

const props = defineProps({
    permission: {
        Type: String,
        required: true
    },
    component: {
        Type: Comment,
        required: true
    }
});

const loading = ref(false);
const error = ref(false);

const allowed = ref(false);

const can = async () => {
    loading.value = true;

    try {
        const response = await AuthService.can(props.permission);

        if (response?.data?.can) {
            allowed.value = true;
        }
    } catch (AxiosError) {
        error.value = true;
    }

    loading.value = false;
};
</script>

<template>
    <Component v-if="allowed" :is="component" />
    <div v-else-if="loading" class="flex items-center w-full h-full">
        <AppProgressSpinner />
    </div>
    <AppOops v-else-if="error" />
    <AppAccessDenied v-else />
</template>
