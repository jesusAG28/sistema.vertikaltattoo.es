<script setup>
import { ref } from 'vue';
import ImageCropper from '@/components/stage/discarded/ImageCropper.custom.vue';

const img = ref('https://transport-api.test/demo/assets/user/1/image/poster.jpeg');
</script>

<template>
    <div class="flex flex-col gap-4">
        <ImageCropper :img />
    </div>
</template>
