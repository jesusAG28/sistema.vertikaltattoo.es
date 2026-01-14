<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue';
import AppProgressSpinner from '@/layout/AppProgressSpinner.vue';
import { Cropper } from 'vue-advanced-cropper';
import CustomCircleStencil from './CustomCircleStencil.vue';
import CustomSquareStencil from './CustomSquareStencil.vue';
import { FileService } from '@/service/FileService';
import { useI18n } from 'vue-i18n';

import 'vue-advanced-cropper/dist/style.css';

const toast = useToast();

const { t } = useI18n();

const props = defineProps({
    image: {
        type: String,
        default: null
    },
    stencil: {
        type: String,
        default: null
    }
});

const emit = defineEmits(['uploaded']);

const reference = ref(null);

const ready = ref(false);

const uploading = ref(false);

const stencilComponent = computed(() => {
    return props.stencil === 'circle' ? CustomCircleStencil : CustomSquareStencil;
});

const onReady = () => {
    ready.value = true;
};

const onSave = async () => {
    const result = reference.value.getResult();

    result.canvas.toBlob((blob) => {
        const reader = new FileReader();

        reader.onload = () => {
            upload(reader.result).then((upload) => {
                if (upload) {
                    emit('uploaded', {
                        ...upload,
                        preview: result.canvas.toDataURL('image/webp')
                    });
                }
            });
        };

        reader.readAsArrayBuffer(blob);
    }, 'image/webp');
};

const upload = async (file) => {
    uploading.value = true;

    try {
        const response = await FileService.upload(file);

        if (response.data?.upload?.id) {
            uploading.value = false;
            return response.data.upload;
        }
    } catch (AxiosError) {
        toast.add({
            severity: 'error',
            summary: t('upload.store.error'),
            life: 3000
        });
    }

    uploading.value = false;
    return null;
};
</script>

<template>
    <div class="relative flex flex-col gap-4 w-full min-h-[300px]">
        <Cropper ref="reference" :src="props.image" :stencil-component @ready="onReady" />
        <div v-if="!ready" class="absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center">
            <AppProgressSpinner />
        </div>
        <div v-else class="sticky bottom-0 flex justify-center">
            <Button :loading="uploading" :disabled="uploading" icon="pi pi-check" :label="t('upload.save')" :title="t('upload.save')" @click="onSave" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
:deep(.vue-advanced-cropper) {
    @apply rounded-[var(--p-form-field-border-radius)] overflow-hidden;
}
</style>
