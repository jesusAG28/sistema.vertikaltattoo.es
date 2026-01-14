<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import ImageManager from '@/components/stage/ImageManager.stage.vue';

const authStore = useAuthStore();

const initialValues = ref({
    image: authStore.user?.image ? `${authStore.assetsBaseUrl}${authStore.user.image}` : null,
    uploadId: null
});

const uploadId = ref(initialValues.value.uploadId);
</script>

<template>
    <ImageManager :image="initialValues.image ?? null" v-model:upload-id="uploadId" />
</template>
