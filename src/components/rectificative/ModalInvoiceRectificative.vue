@ -1,167 +0,0 @@
<script setup>
import { onBeforeMount, ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import AppProgressSpinner from '@/layout/AppProgressSpinner.vue';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useI18n } from 'vue-i18n';
import { InvoiceService } from '@/service/InvoiceService';
import { InvoiceItemService } from '@/service/InvoiceItemService';
import { getInvoiceRectificative, invoiceTypeRectificative } from '@/clases/invoice';

const toast = useToast();
const emit = defineEmits(['saved', 'cancel']);
const { t } = useI18n();

const props = defineProps({
    id: { type: String, required: true, default: null },
});

const typeRectificative = ref(0);
const showInvoiesItems = computed(() =>{
    return typeRectificative.value == 1;
});

const resolver = computed(() => zodResolver(getInvoiceRectificative(t)));

const loadingErrors = ref([]);
const backendErrors = ref({});
const hasAdditionalErrors = computed(() => loadingErrors.value.length > 0 || Object.entries(backendErrors.value).length > 0);
const items_invoices_ids = ref([]);
const submitting = ref(false);
const loading = ref(false);

const submit = async ({valid, values}) => {
    
    if (!valid) {
        return;
    }

    submitting.value = true;
    
    try {
        const response = await InvoiceService.rectificative(props.id, values);

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

onBeforeMount(() => {
    fetchInvoiceItems();
});
const loadingInvoiceItems = ref(true);
const invoiceItems = ref([]);
const fetchInvoiceItems = async () => {
    loadingInvoiceItems.value = true;

    try {
        const response = await InvoiceItemService.search({invoice_id: props.id, is_rectificated: false });

        if (response.data?.invoice_items) {
            invoiceItems.value = response.data.invoice_items;
        }

    } catch (AxiosError) {
        const error = {
            summary: t('invoice.invoice_item.error', { id: props.id })
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

    loadingInvoiceItems.value = false;
}
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

        <!-- Mirar -->
        <div v-if="invoiceItems && invoiceItems.length > 0">
            <Form v-slot="$form" :resolver="resolver" :initial-values="invoiceItems" @submit="submit" class="flex justify-center flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label for="invoice.type_rectificative" class="first-letter:uppercase">{{ t('invoice.type_rectify.title') }}</label>
                    <Select
                        id="invoice.type_rectificative"
                        name="type"
                        v-model="typeRectificative"
                        :options="invoiceTypeRectificative"
                        option-value="id"
                        :option-label="(type) =>t(type.name)"
                        :placeholder="loadingInvoiceItems ? t('subscription.subscription_types.placeholder.loading') : t('subscription.subscription_types.placeholder.single')"
                        :loading="loadingInvoiceItems"
                    />
                </div>

                
                <div v-if="showInvoiesItems" class="flex flex-col gap-2">
                    <label for="subscription.subscription_type_id" class="first-letter:uppercase mb-2">{{ t('subscription.attributes.subscription_type') }}</label>
                    <div v-for="itemInvoice of invoiceItems" :key="itemInvoice.id" class="flex items-center gap-2">
                        <Checkbox v-model="items_invoices_ids" :inputId="itemInvoice.id" name="items_invoices_ids" :value="itemInvoice.id" />
                        <label :for="itemInvoice.id">{{ itemInvoice.description }}</label>
                    </div>
                </div>
                
                <Button type="submit" :loading="submitting"
                    class="mt-5"
                    :label="t('invoice.rectify')"
                    :disabled="!$form.valid || hasAdditionalErrors || submitting"
                    severity="warn"
                    :title="t('vehicle_accident.store.title')"
                />
            </Form>
        </div>
        <div v-else>
            <p>{{ "No ha lineas de factura por rectificar" }}</p>
        </div>
    </div>
</template>