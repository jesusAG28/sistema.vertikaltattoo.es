<script setup>
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue';

const props = defineProps({
    initialImageSrc: {
        type: String,
        default: null
    },
    maxSize: {
        type: Number,
        default: 512000
    }
});

const toast = useToast();

const input = ref();
const image = ref(props.initialImageSrc);
const newImage = ref(null);
const preview = computed(() => {
    if (newImage.value) {
        return createObjectURL(newImage.value);
    }

    if (image.value) {
        return image.value;
    }

    return null;
});

const errors = ref([]);
const uploadId = defineModel('uploadId', {
    type: Number,
    default: null
});

const unlink = defineModel('unlink', {
    type: Boolean,
    default: false
});

watch([image, newImage], () => {
    unlink.value = !!props.initialImageSrc && !image.value && !newImage.value;
});

const change = () => {
    errors.value.length = 0;

    if (input.value?.files[0]) {
        // choose => change validation
        validate(input.value.files[0]);
    }

    if (errors.value.length > 0) {
        dragging.value = false;
        toast.add({
            severity: 'error',
            summary: 'Error validating image file',
            detail: errors.value.join('\n'),
            life: 3000
        });
        return;
    }

    newImage.value = input.value.files[0];
};
const choose = () => {
    input.value.click();
};
const clear = () => {
    if (newImage.value) {
        newImage.value = null;
    } else if (image.value) {
        image.value = null;
    }
};
const reset = () => {
    image.value = props.initialImageSrc;
};

const dragging = ref(false);

const dragover = () => {
    dragging.value = true;
};

const dragleave = () => {
    dragging.value = false;
};

const drop = (event) => {
    errors.value.length = 0;

    if (!event.dataTransfer.files.length > 0) {
        dragging.value = false;
        return;
    }

    // drop exclusive validation:
    // unique file drop validation
    if (event.dataTransfer.files.length > 1) {
        errors.value.push('Multiple files dropped.'); // TODO: add new translation or find existing (validation) translation
    } else {
        // file drop mime type (image/*) validation
        if (!event.dataTransfer.files[0].type.startsWith('image/')) {
            errors.value.push('Unallowed mime type.'); // TODO: add new translation or find existing (validation) translation
        }

        validate(event.dataTransfer.files[0]);
    }

    if (errors.value.length > 0) {
        dragging.value = false;
        toast.add({
            severity: 'error',
            summary: 'Error validating image file', // TODO: add new translation or find existing (validation) translation
            detail: errors.value.join('\n'),
            life: 3000
        });
        return;
    }

    newImage.value = event.dataTransfer.files[0];
    dragging.value = false;
};

const highlight = computed(() => (dragging.value ? '' : null));

const validate = (file) => {
    if (file.size > props.maxSize) {
        errors.value.push(`Max file size: ${niceFileSize(props.maxSize)}`); // TODO: add new translation or find existing (validation) translation
    }
};

const createObjectURL = (file) => {
    let src = URL.createObjectURL(file);

    setTimeout(() => {
        URL.revokeObjectURL(src);
    }, 1000);

    return src;
};

const niceFileSize = (size) => {
    if (size < 1e3) {
        return `${size} bytes`;
    } else if (size >= 1e3 && size < 1e6) {
        return `${(size / 1e3).toFixed(1)} KB`;
    } else {
        return `${(size / 1e6).toFixed(1)} MB`;
    }
};
</script>

<template>
    <div class="card flex flex-col gap-6 items-center justify-center">
        <input ref="input" name="upload" type="file" accept="image/*" @change="change" style="display: none" />
        <div>
            <pre>initial-value: {{ props.initialImageSrc }}</pre>
            <pre>image: {{ image }}</pre>
            <pre>new image: {{ newImage?.name }}</pre>
            <pre>image upload_id: {{ uploadId ?? 'null' }}</pre>
            <pre>unlink image: {{ unlink }}</pre>
        </div>
        <div
            image-dropzone
            @dragover.prevent="dragover"
            @dragleave="dragleave"
            @drop.prevent="drop"
            :highlight
            :class="{
                'w-full px-[var(--p-form-field-padding-x)] py-[var(--p-form-field-padding-y)] bg-[var(--p-form-field-background)] [&[highlight]]:bg-[var(--image-dropzone-highlight-bg)] border border-[var(--p-form-field-border-color)] rounded-[var(--p-form-field-border-radius)]': true,
                'bg-[rgb(0 0 0 / 50)]': dragging
            }"
            style=""
        >
            <div class="flex gap-4 items-center">
                <div class="relative w-64 h-64 flex justify-center items-center">
                    <template v-if="newImage || image">
                        <img :src="preview" class="w-full h-full object-scale-down rounded-full bg-[var(--image-dropzone-preview-bg)] hover:bg-[var(--image-dropzone-preview-hover-bg)]" />
                        <div class="absolute top-0 right-0">
                            <Button severity="danger" text rounded @click="clear" icon="pi pi-times" :title="`${newImage ? 'Clear choosen' : 'Unlink'} image`" />
                        </div>
                    </template>
                    <Button v-if="props.initialImageSrc && !newImage && !image" text rounded @click="reset" icon="pi pi-replay" title="Restore initial image" />
                </div>
                <div class="grow flex flex-col">
                    <div class="px-[var(--p-form-field-padding-x)] py-[var(--p-form-field-padding-y)]">
                        <span>Drop image here</span>
                    </div>
                    <div class="px-[var(--p-form-field-padding-x)]">
                        <small>or</small>
                    </div>
                    <div class="px-[var(--p-form-field-padding-x)] py-[var(--p-form-field-padding-y)]">
                        <Button outlined @click="choose" icon="pi pi-plus" label="Choose image" />
                    </div>
                    <div v-if="newImage" class="flex items-baseline gap-1.5 px-[var(--p-form-field-padding-x)] py-[var(--p-form-field-padding-y)]">
                        <small>{{ newImage.name }}</small>
                        <small>{{ niceFileSize(newImage.size) }}</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
[image-dropzone] {
    --image-dropzone-preview-bg: var(--p-surface-100);
    --image-dropzone-preview-hover-bg: var(--p-surface-300);
    --image-dropzone-highlight-bg: var(--p-surface-100);
}

.app-dark [image-dropzone] {
    --image-dropzone-highlight-bg: var(--p-surface-800);
    --image-dropzone-preview-bg: var(--p-surface-800);
    --image-dropzone-preview-hover-bg: var(--p-surface-700);
}
</style>
