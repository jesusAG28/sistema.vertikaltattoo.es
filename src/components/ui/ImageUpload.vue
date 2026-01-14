<script setup>
// import { ref, computed, watch } from 'vue';
import { ref, computed } from 'vue';
import { useToast } from 'primevue';
import { FileService } from '@/service/FileService';
import ImageCropper from './image-cropper/ImageCropper.vue';
import { useI18n } from 'vue-i18n';

const toast = useToast();

const { t } = useI18n();

const uploadId = defineModel('uploadId', {
    type: Number,
    default: null
});

const unlink = defineModel('unlink', {
    default: false,
    type: Boolean
});

const props = defineProps({
    image: {
        type: String,
        default: null
    },
    rounded: {
        type: Boolean,
        default: false
    },
    maxSize: {
        type: Number,
        default: 512000
    },
    accept: {
        type: String,
        default: 'image/*'
    }
});

const errors = ref([]);
const input = ref(null);
const choosenImage = ref(null);
const croppedImage = ref(null);
const displayCropper = ref(false);
const dragging = ref(false);

const stencil = computed(() => (props.rounded ? 'circle' : 'square'));

const highlightDropZone = computed(() => (dragging.value ? '' : null));

// discard unlink value if there is an upload_id:
// setting it to false if there is an upload_id losses the ability to know when to show the restore (image) button
// example:
// with initial image (props.image) click clear image button (unlink = true), then save (upload) a cropped image and click the clear image button.
// since the unlink state would have changed to false, the initial image would be restored (after beeing marked for delete at the start)
// watch(uploadId, () => {
//     // unlink.value = !uploadId.value ? unlink.value : false;
//     if (uploadId.value && unlink.value === true) {
//         unlink.value = false;
//     }
// });
const dragover = () => {
    dragging.value = true;
};

const dragleave = () => {
    dragging.value = false;
};

const dropFile = (event) => {
    errors.value.length = 0;

    if (!event.dataTransfer.files.length > 0) {
        dragging.value = false;
        return;
    }

    // drop exclusive validation:
    // unique file drop validation
    if (event.dataTransfer.files.length > 1) {
        errors.value.push(t('validation.size.array', { attribute: t('upload.image'), size: 1 }));
    } else {
        // file drop mime type (image/*) validation
        if (!event.dataTransfer.files[0].type.startsWith(props.accept === 'image/*' ? 'image/' : props.accept)) {
            errors.value.push(t('validation.mimetypes', { attribute: t('upload.image'), values: props.accept }));
        }

        validateLocalFile(event.dataTransfer.files[0]);
    }

    if (errors.value.length > 0) {
        dragging.value = false;
        toast.add({
            severity: 'error',
            summary: t('upload.validation.error', { attribute: t('upload.image') }),
            detail: errors.value.join('\n'),
            life: 3000
        });
        return;
    }

    dragging.value = false;
    choosenImage.value = event.dataTransfer?.files[0] ? event.dataTransfer.files[0] : null;
    if (choosenImage.value) {
        displayCropper.value = true;
    }
};

const openLocalFileChooser = () => {
    input.value.click();
};

const chooseFile = () => {
    errors.value.length = 0;

    if (input.value?.files[0]) {
        // choose => change validation
        validateLocalFile(input.value.files[0]);
    }

    if (errors.value.length > 0) {
        toast.add({
            severity: 'error',
            summary: t('upload.validation.error', { attribute: t('upload.image') }),
            detail: errors.value.join('\n'),
            life: 3000
        });
        return;
    }

    choosenImage.value = input.value?.files[0] ? input.value.files[0] : null;
    if (choosenImage.value) {
        displayCropper.value = true;
    }
};

const validateLocalFile = (file) => {
    if (file.size > props.maxSize) {
        errors.value.push(t('validation.lte.file', { attribute: t('upload.image'), value: FileService.size(props.maxSize) }));
    }
};

const uploaded = (upload) => {
    if (upload?.id) {
        uploadId.value = upload.id;
    }
    if (upload?.preview) {
        croppedImage.value = upload.preview;
    }
    displayCropper.value = false;
};

const restoreImage = () => {
    unlink.value = false;
};

const clearImage = () => {
    if (croppedImage.value) {
        croppedImage.value = null;
        uploadId.value = null;
    } else if (props.image && unlink.value === false) {
        unlink.value = true;
    }
};
</script>

<template>
    <div>
        <input ref="input" name="upload" type="file" :accept="props.accept" @change="chooseFile" style="display: none" />

        <div
            image-dropzone
            @dragover.prevent="dragover"
            @dragleave="dragleave"
            @drop.prevent="dropFile"
            :highlight="highlightDropZone"
            :class="{
                'px-[var(--p-form-field-padding-x)] py-[var(--p-form-field-padding-y)] bg-[var(--p-form-field-background)] [&[highlight]]:bg-[var(--image-dropzone-highlight-bg)] border border-[var(--p-form-field-border-color)] rounded-[var(--p-form-field-border-radius)]': true,
                'bg-[rgb(0 0 0 / 50)]': dragging
            }"
        >
            <div class="flex flex-col flex-wrap justify-center items-center gap-4">
                <div class="relative w-64 h-64 shrink-0 flex justify-center items-center">
                    <img
                        v-if="(!unlink && props.image) || croppedImage"
                        :src="croppedImage ?? props.image"
                        :class="`w-full h-full object-scale-down bg-[var(--image-dropzone-preview-bg)] hover:bg-[var(--image-dropzone-preview-hover-bg)] rounded-${props.rounded ? 'full' : 'md'}`"
                    />
                    <div v-if="unlink && props.image && !croppedImage" class="flex justify-center items-center">
                        <Button text rounded @click="restoreImage" icon="pi pi-replay" :title="t('upload.restore', { attribute: t('upload.image') })" />
                    </div>
                    <div v-if="(props.image && !unlink) || croppedImage" class="absolute top-0 right-0">
                        <Button severity="danger" text rounded icon="pi pi-times" :title="t(croppedImage ? 'upload.clear' : 'upload.unlink', { attribute: t('upload.image') })" @click="clearImage" />
                    </div>
                </div>
                <div class="flex flex-col justify-center items-center gap-2 px-[var(--p-form-field-padding-x)] py-[var(--p-form-field-padding-y)]">
                    <Button outlined @click="openLocalFileChooser" icon="pi pi-plus" :label="t('upload.choose')" :title="t('upload.choose')" />
                    <span>{{ t('upload.drop', { attribute: t('upload.image') }) }}</span>
                </div>
            </div>
        </div>
        <Dialog header="Dialog" v-model:visible="displayCropper" :style="{ width: '500px', maxWidth: '90vw' }" :modal="true">
            <ImageCropper :image="FileService.createObjectURL(choosenImage)" :stencil @uploaded="uploaded" />
            <template #footer />
        </Dialog>
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
