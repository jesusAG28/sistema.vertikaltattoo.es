<script setup>
import { ref } from 'vue';
import { Cropper as AdvancedCropper, CircleStencil as stencilComponent, Preview } from 'vue-advanced-cropper';

import 'vue-advanced-cropper/dist/style.css';

const props = defineProps({
    img: {
        type: String,
        default: null
    }
});

const cropper = ref(null);

const stencilProps = ref({
    lines: {},
    handlersClasses: {
        default: 'handler',
        eastNorth: 'handler-east-north',
        westNorth: 'handler-west-north',
        westSouth: 'handler-west-south',
        eastSouth: 'handler-east-south'
    },
    previewClass: 'preview'
});

const canvas = ref({
    height: 128,
    width: 128
});

// const preview = ref(null);

const result = ref({
    coordinates: null,
    image: null
});

// const change = ({ canvas, coordinates, image }) => {
const change = ({ coordinates, image }) => {
    // preview.value = canvas.toDataURL();
    result.value = {
        coordinates,
        image
    };
};
</script>

<template>
    <div v-if="props.img" class="card flex flex-col gap-4">
        <div>
            {{ props.img }}
        </div>

        <div>
            <!-- <advanced-cropper ref="cropper" :src="props.img" :stencil-component :stencil-props :image-restriction :resize-image circle :debounce="false" :canvas @change="change" class="cropper" /> -->
            <advanced-cropper ref="cropper" :src="props.img" :stencil-component :stencil-props circle :debounce="false" :canvas @change="change" class="cropper" />
        </div>

        <div>
            <preview :width="120" :height="120" :image="result.image" :coordinates="result.coordinates" class="preview" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.cropper {
    width: 12rem;
    background: #ddd;

    :deep(.handler) {
        margin: 0.5rem;
        background-color: transparent;
        border: 1px solid rgba(255, 255, 255, 0.5);
    }

    :deep(.handler-east-north) {
        border-bottom-width: 0;
        border-left-width: 0;
        margin-bottom: 0;
        margin-left: 0;
    }

    :deep(.handler-east-south) {
        border-top-width: 0;
        border-left-width: 0;
        margin-top: 0;
        margin-left: 0;
    }

    :deep(.handler-west-north) {
        border-right-width: 0;
        border-bottom-width: 0;
        margin-right: 0;
        margin-bottom: 0;
    }

    :deep(.handler-west-south) {
        border-top-width: 0;
        border-right-width: 0;
        margin-top: 0;
        margin-right: 0;
    }

    :deep(.preview) {
        border-radius: 50%;
        border: dashed 1px rgba(255, 255, 255, 0.5);
    }
}

.preview {
    border-radius: 50%;
}
</style>
