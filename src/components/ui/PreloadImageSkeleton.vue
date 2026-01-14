<script setup>
import { ref } from 'vue';

const loaded = ref(false);

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    src: {
        type: String,
        default: null
    },
    alt: {
        type: String,
        default: null
    },
    title: {
        type: String,
        default: null
    },
    skeletonStyle: null,
    imageStyle: null
});

const toggleLoaded = () => {
    loaded.value = !loaded.value;
};
</script>

<template>
    <div v-if="props.src">
        <Skeleton v-if="loading || !loaded" :style="props.skeletonStyle" />
        <Transition>
            <img v-show="!loading && loaded" :src="props.src" :alt="props.alt" :title="props.title" :style="props.imageStyle" class="rounded" @load="toggleLoaded" />
        </Transition>
    </div>
</template>

<style lang="scss" scoped>
.v-enter-active,
.v-leave-active {
    @apply transition-opacity duration-500;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>
