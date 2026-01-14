<script setup>
import { RectangleStencil } from 'vue-advanced-cropper';

const linesClasses = {
    default: 'line',
    north: 'line--north',
    west: 'line--west',
    south: 'line--south',
    east: 'line--east'
};

const handlers = {
    eastNorth: true,
    north: false,
    westNorth: true,
    west: false,
    westSouth: true,
    south: false,
    eastSouth: true,
    east: false
};

const aspectRatios = () => {
    return {
        minimum: 1,
        maximum: 1
    };
};

defineExpose({
    aspectRatios
});
</script>

<template>
    <RectangleStencil :linesClasses :handlers class="square-stencil" />
</template>

<style lang="scss">
.square-stencil {
    .line {
        border-style: dashed;
        border-color: white;

        &--north {
            border-top-width: 2px;
        }

        &--west {
            border-left-width: 2px;
        }

        &--south {
            border-bottom-width: 2px;
        }

        &--east {
            border-right-width: 2px;
        }
    }
}
</style>
