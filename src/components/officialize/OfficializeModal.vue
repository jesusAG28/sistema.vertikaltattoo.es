<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import AppProgressSpinner from '@/layout/AppProgressSpinner.vue';
import { useI18n } from 'vue-i18n';
import { InvoiceService } from '@/service/InvoiceService';

const toast = useToast();
const emit = defineEmits(['saved', 'cancel']);
const { t } = useI18n();

const props = defineProps({
    id: { type: String, required: true, default: null },
    modal: { type: Boolean, default: false }
});

const loadingErrors = ref([]);
const backendErrors = ref({});
const hasAdditionalErrors = computed(() => loadingErrors.value.length > 0 || Object.entries(backendErrors.value).length > 0);

const submitting = ref(false);

const loading = ref(false);

const submit = async () => {
    submitting.value = true;

    try {
        const response = await InvoiceService.officialize(props.id, { serie_id: 4 });

        if (response.data?.invoice) {
            toast.add({
                severity: 'success',
                summary: t('invoice.officialize.success'),
                life: 3000
            });
            emit('saved', response.data.invoice);
        }
    } catch (AxiosError) {
        if (AxiosError.response?.status === 422 && AxiosError.response?.data?.errors) {
            backendErrors.value = AxiosError.response.data.errors;
            submitting.value = false;
            return;
        }

        const error = {
            summary: t('invoice.officialize.error')
        };

        if (AxiosError.response?.data?.message) {
            error.detail = AxiosError.response.data.message;
        }

        loadingErrors.value.push(error);
        toast.add({
            severity: 'error',
            ...error,
            life: 3000
        });
    }

    submitting.value = false;
};
</script>

<template>
    <div v-if="loading" class="flex items-center w-full h-full">
        <AppProgressSpinner />
    </div>
    <div v-else>
        <div v-if="hasAdditionalErrors" class="flex flex-col gap-2">
            <Message v-for="error of loadingErrors" :key="error" severity="error">
                <div class="flex flex-col gap-1">
                    {{ error.summary }}
                    <small v-if="error.detail">{{ error.detail }}</small>
                </div>
            </Message>
        </div>
        <h1 class="text-2xl mb-6">{{ t('invoice.laf_status.officialize_question') }}</h1>
        <Button :loading="submitting" @click="submit" :label="t('invoice.accept')" severity="warn" :title="t('invoice.store.title')" />
    </div>
</template>
