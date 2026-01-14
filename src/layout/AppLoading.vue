<script setup>
import { useLoadingStore } from '@/stores/loading';
import AppProgressSpinner from './AppProgressSpinner.vue';

const loadingStore = useLoadingStore();

const pt = {
    mask: { class: 'p-dialog-mask p-overlay-mask p-overlay-mask-enter' }
};
</script>

<template>
    <Dialog v-model:visible="loadingStore.loading" modal :closable="false" :show-header="false" unstyled :pt="pt">
        <AppProgressSpinner />
    </Dialog>
</template>

<style lang="scss" scoped></style>
