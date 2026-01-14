<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import AppProgressSpinner from '@/layout/AppProgressSpinner.vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { EntityService } from '@/service/EntityService';

const toast = useToast();
const emit = defineEmits(['saved', 'cancel']);
const { t } = useI18n();

const props = defineProps({
    modal: { type: Boolean, default: false },
});

const selectedFile = ref(null);

const loadingErrors = ref([]);
const backendErrors = ref({});
const hasAdditionalErrors = computed(() => loadingErrors.value.length > 0 || Object.entries(backendErrors.value).length > 0);

const submitting = ref(false);
const loading = ref(false);
const baseUrl = import.meta.env.VITE_API_URL;
const uploadUrl = computed(() => `${baseUrl}/entities/uploadCSV`);


const beforeSend = ({ xhr }) => {
    const authStore = useAuthStore();

    if (authStore.user?.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${authStore.user.token}`);
    }
};


const submit = async () => {
    submitting.value = true;
    console.log(selectedFile.value);
    try {
        const response = await EntityService.importCSV(selectedFile.value);

        if (response.data?.invoice) {
            toast.add({
                severity: 'success',
                summary: !props.id ? t('vehicle_accident.store.success') : t('vehicle_accident.update.success', { id: props.id }),
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
            summary: !props.id ? t('vehicle_accident.store.error') : t('vehicle_accident.update.error', { id: props.id })
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
        <FileUpload  
            auto
            mode="basic" 
            accept=".csv" 
            choose-icon="pi pi-file-import" 
            name="file" 
            :url="uploadUrl" 
            choose-label=""
            @before-send="beforeSend"
            class="mt-2"
        />
        <Button
            :loading="submitting"
            @click='submit'
            :label="t('invoice.accept')"
            severity="warn"
            :title="t('vehicle_accident.store.title')"
            class="mt-3"
        />
    </div>
</template>