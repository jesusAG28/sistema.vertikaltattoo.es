<script setup>
import { useToast } from 'primevue';
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import router from '@/router';
import AppProgressSpinner from '@/layout/AppProgressSpinner.vue';
import { useSelectData } from '@/composables/useSelectData';
import { ConfigurationService } from '@/service/ConfigurationService';
import { EntityService } from '@/service/EntityService';
import { InvoiceService } from '@/service/InvoiceService';
import { PaymentMethodsService } from '@/service/PaymentMethodsService';
import { createInvoiceFromApi, getInvoiceSchema, initialInvoiceState } from '@/clases/invoice';
import OfficializeModal from '../officialize/OfficializeModal.vue';
import InvoiceItemsTable from './InvoiceItemsTable.vue';
import ModalInvoiceRectificative from '../rectificative/ModalInvoiceRectificative.vue';
import { capitalizeFirst } from '@/utils/stringHelpers';

const toast = useToast();

const { t } = useI18n();

const props = defineProps({
    id: {
        type: String,
        default: null
    }
});

const invoice = ref({ ...initialInvoiceState });

const resolver = computed(() => zodResolver(getInvoiceSchema(t)));

const showDialogOfficialize = ref(false);
const showDialogRectificative = ref(false);
const loadingErrors = ref([]);
const backendErrors = ref({});
const hasAdditionalErrors = computed(() => loadingErrors.value.length > 0 || Object.entries(backendErrors.value).length > 0);

const submitting = ref(false);
const submit = async ({ valid, values }) => {
    if (!valid) {
        return;
    }

    submitting.value = true;

    try {
        const payload = {
            ...values,
            entity_id: invoice.value.entity_id
        };

        const response = await (!props.id ? InvoiceService.store(payload) : InvoiceService.update(props.id, payload));

        if (response.data) {
            toast.add({
                severity: 'success',
                summary: !props.id ? t('invoice.store.success') : t('invoice.update.success', { id: props.id }),
                life: 3000
            });

            // redirecto to the id of the invoice
            router.push(`/invoices/edit/${response.data.invoice.id}`);

            // setTimeout(() => {
            //     router.push('/invoices');
            // }, 3000);
        }
    } catch (AxiosError) {
        console.log(AxiosError);

        if (AxiosError.response?.status === 422 && AxiosError.response?.data?.errors) {
            backendErrors.value = AxiosError.response.data.errors;

            submitting.value = false;
            return;
        }

        const error = {
            summary: !props.id ? t('invoice.store.error') : t('invoice.update.error', { id: props.id })
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

const loading = ref(false);
onBeforeMount(async () => {
    loading.value = true;
    fetchEntities();
    fetchPaymentMethods();

    if (!props.id && checkIssuerConfiguration()) {
        fetchIssuerConfiguration();
    }

    if (props.id) {
        await fetchInvoice();
    }

    loading.value = false;
});

const fetchIssuerConfiguration = async () => {
    try {
        const response = await ConfigurationService.index();

        if (response.data?.configuration) {
            invoice.value.issuer_name = response.data.configuration.issuer_name ?? '';
            invoice.value.issuer_crn = response.data.configuration.issuer_crn ?? '';
            invoice.value.issuer_address = response.data.configuration.issuer_address ?? '';
            invoice.value.issuer_population = response.data.configuration.issuer_population ?? '';
            invoice.value.issuer_province = response.data.configuration.issuer_province ?? '';
            invoice.value.issuer_postal_code = response.data.configuration.issuer_postal_code ?? '';
        }
    } catch (AxiosError) {
        const error = {
            summary: t('invoice.error', { id: props.id })
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
};

const checkIssuerConfiguration = async () => {
    try {
        await ConfigurationService.checkIssuer();
        return false;
    } catch (AxiosError) {
        const error = {
            summary: t('configuration.error.issuer', { id: props.id })
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
        return true;
    }
};
const loadingInvoice = ref(false);
const fetchInvoice = async () => {
    loadingInvoice.value = true;

    try {
        const response = await InvoiceService.show(props.id);

        if (response.data?.invoice) {
            let invoi = createInvoiceFromApi(response.data.invoice);
            invoi.entity_id = invoi.entity_id?.id ?? invoi.entity_id;
            invoi.payment_methods_id = invoi.payment_methods_id?.id ?? invoi.payment_methods_id;
            invoice.value = invoi;
        }
    } catch (AxiosError) {
        const error = {
            summary: t('invoice.error', { id: props.id })
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

    loadingInvoice.value = false;
};

const {
    items: entities,
    loading: loadingEntities,
    fetchData: fetchEntities
} = useSelectData(EntityService.list, {
    toast,
    i18n: { t },
    errorMsgKey: 'invoice.entities.error',
    dataValue: 'entities'
});

const {
    items: payment_methods,
    loading: loadingPaymentMethods,
    fetchData: fetchPaymentMethods
} = useSelectData(PaymentMethodsService.list, {
    toast,
    i18n: { t },
    errorMsgKey: 'invoice.entities.error',
    dataValue: 'payment_methods'
});

const refForm = ref(null);

watch(
    () => invoice.value.entity_id,
    (newValue) => {
        const selectEntity = entities.value.find((e) => e.id === newValue);
        if (selectEntity && refForm.value) {
            refForm.value.setFieldValue('entity_name', selectEntity.name);
            refForm.value.setFieldValue('entity_crn', selectEntity.crn);
            refForm.value.setFieldValue('entity_address', selectEntity.address);
            refForm.value.setFieldValue('entity_population', selectEntity.population);
            refForm.value.setFieldValue('entity_province', selectEntity.province);
            refForm.value.setFieldValue('entity_postal_code', selectEntity.postal_code);
        }
    }
);

const status_laf_officialize = computed(() => invoice.value.laf_status_id?.id == 10);
const status_laf_rectificative = computed(() => invoice.value.laf_status_id?.id == 1);

const saveOfficialize = (invoOfficialize) => {
    let invoOffi = createInvoiceFromApi(invoOfficialize);
    invoOffi.entity_id = invoOffi.entity_id?.id ?? invoOffi.entity_id;
    invoOffi.payment_methods_id = invoOffi.payment_methods_id?.id ?? invoOffi.payment_methods_id;

    invoice.value = invoOffi;
    showDialogOfficialize.value = false;
};

const cancel = () => {
    router.replace('/invoices');
};
</script>
<template>
    <div v-if="loading" class="flex items-center w-full h-full">
        <AppProgressSpinner />
    </div>
    <div v-else class="card" :class="invoice?.laf_status_id?.id == 10 ? 'outline outline-red-500' : ''">
        <div class="font-semibold text-xl mb-5 mt-3">
            <!--invoice?.laf_status_id?.id in 1 or 2 -->
            <span v-if="invoice?.laf_status_id?.id == 1 || invoice?.laf_status_id?.id == 2">
                <Tag v-if="invoice?.laf_status_id?.id == 1" severity="success" :value="t('invoice.laf_status.official')" :rounded="true" />
                <Tag v-else-if="invoice?.laf_status_id?.id == 2" severity="danger" :value="t('invoice.laf_status.rectificative')" :rounded="true" />
                <span class="ml-2">{{ invoice.full_number }}</span>
            </span>

            <span v-else>
                <Tag severity="warn" :value="t('invoice.laf_status.draft')" :rounded="true" />
                <span class="ml-2">{{ invoice.id }}</span>
            </span>
        </div>

        <Form ref="refForm" v-slot="$form" :initial-values="invoice" :resolver="resolver" @submit="submit" class="space-y-4">
            <div class="flex flex-col gap-4">
                <div v-if="hasAdditionalErrors" class="flex flex-col gap-2">
                    <Message v-for="error of loadingErrors" :key="error" severity="error">
                        <div class="flex flex-col gap-1">
                            {{ error.summary }}
                            <small v-if="error.detail">{{ error.detail }}</small>
                        </div>
                    </Message>
                </div>

                <!-- Datos del emisor -->
                <div class="font-semibold text-xl mb-5 card-title">Datos del emisor</div>

                <div class="flex flex-row gap-4">
                    <div class="flex flex-col basis-[80%] gap-1">
                        <label for="configuration.issuer_name" class="first-letter:uppercase">{{ t('configuration.attributes.issuer_name') }}</label>
                        <InputText id="configuration.issuer_name" name="issuer_name" type="text" disabled :invalid="!!backendErrors.issuer_name || $form.issuer_name?.invalid" @focusin="delete backendErrors.issuer_name" autocomplete="off" />
                    </div>

                    <div class="flex flex-col gap-1 basis-[20%]">
                        <label for="configuration.issuer_crn" class="first-letter:uppercase">{{ t('configuration.attributes.issuer_crn') }}</label>
                        <InputText id="configuration.issuer_crn" name="issuer_crn" type="text" disabled :invalid="!!backendErrors.issuer_crn || $form.issuer_crn?.invalid" @focusin="delete backendErrors.issuer_crn" autocomplete="off" />
                        <template v-if="$form.issuer_crn?.invalid">
                            <Message v-for="error of $form.issuer_crn.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.issuer_crn">
                            <Message v-for="errorMessage of backendErrors?.issuer_crn" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>

                <div class="flex flex-row gap-4">
                    <div class="flex flex-col gap-1 basis-[40%]">
                        <label for="configuration.issuer_address" class="first-letter:uppercase">{{ t('configuration.attributes.issuer_address') }}</label>
                        <InputText
                            id="configuration.issuer_address"
                            name="issuer_address"
                            type="text"
                            disabled
                            :invalid="!!backendErrors.issuer_address || $form.issuer_address?.invalid"
                            @focusin="delete backendErrors.issuer_address"
                            autocomplete="off"
                        />
                        <template v-if="$form.issuer_address?.invalid">
                            <Message v-for="error of $form.issuer_address.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.issuer_address">
                            <Message v-for="errorMessage of backendErrors?.issuer_address" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col gap-1 basis-[20%]">
                        <label for="configuration.issuer_population" class="first-letter:uppercase">{{ t('configuration.attributes.issuer_population') }}</label>
                        <InputText
                            id="configuration.issuer_population"
                            name="issuer_population"
                            type="text"
                            disabled
                            :invalid="!!backendErrors.issuer_population || $form.issuer_population?.invalid"
                            @focusin="delete backendErrors.issuer_population"
                            autocomplete="off"
                        />
                        <template v-if="$form.issuer_population?.invalid">
                            <Message v-for="error of $form.issuer_population.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.issuer_population">
                            <Message v-for="errorMessage of backendErrors?.issuer_population" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col gap-1 basis-[20%]">
                        <label for="configuration.issuer_province" class="first-letter:uppercase">{{ t('configuration.attributes.issuer_province') }}</label>
                        <InputText
                            id="configuration.issuer_province"
                            name="issuer_province"
                            type="text"
                            disabled
                            :invalid="!!backendErrors.issuer_province || $form.issuer_province?.invalid"
                            @focusin="delete backendErrors.issuer_province"
                            autocomplete="off"
                        />
                        <template v-if="$form.issuer_province?.invalid">
                            <Message v-for="error of $form.issuer_province.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.issuer_province">
                            <Message v-for="errorMessage of backendErrors?.issuer_province" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col gap-1 basis-[20%]">
                        <label for="configuration.issuer_postal_code" class="first-letter:uppercase">{{ t('configuration.attributes.issuer_postal_code') }}</label>
                        <InputText
                            id="configuration.issuer_postal_code"
                            name="issuer_postal_code"
                            type="text"
                            v-keyfilter.int
                            disabled
                            :invalid="!!backendErrors.issuer_postal_code || $form.issuer_postal_code?.invalid"
                            @focusin="delete backendErrors.issuer_postal_code"
                            autocomplete="off"
                        />
                        <template v-if="$form.issuer_postal_code?.invalid">
                            <Message v-for="error of $form.issuer_postal_code.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.issuer_postal_code">
                            <Message v-for="errorMessage of backendErrors?.issuer_postal_code" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>

                <!-- Datos de la entidad -->
                <div class="font-semibold text-xl mb-5 mt-5">Datos de la entidad</div>

                <div class="flex flex-row gap-4">
                    <div :class="invoice?.laf_status_id?.id == 10 || invoice?.laf_status_id == null ? '' : 'hidden'" class="flex flex-col gap-1 basis-[40%]">
                        <label for="invoice.entity_id" class="first-letter:uppercase">{{ t('invoice.attributes.entity') }}</label>
                        <Select
                            id="invoice.entity_id"
                            name="entity_id"
                            v-model="invoice.entity_id"
                            filter
                            :options="entities"
                            option-value="id"
                            option-label="name"
                            :placeholder="loadingEntities ? t('invoice.entity.placeholder.loading') : t('invoice.entity.placeholder.single')"
                            :loading="loadingEntities"
                            :invalid="!!backendErrors.entity_id || $form.entity_id?.invalid"
                            @focus="delete backendErrors.entity_id"
                            :disabled="invoice?.laf_status_id?.id != 10 && props.id"
                        />
                        <template v-if="$form.entity_id?.invalid">
                            <Message v-for="error of $form.entity_id.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.entity_id">
                            <Message v-for="errorMessage of backendErrors?.entity_id" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col gap-1 basis-[40%]">
                        <label for="invoice.entity_name" class="first-letter:uppercase">{{ t('entity.attributes.name') }}</label>
                        <InputText
                            id="invoice.entity_name"
                            name="entity_name"
                            type="text"
                            :invalid="!!backendErrors.entity_name || $form.entity_name?.invalid"
                            @focusin="delete backendErrors.entity_name"
                            autocomplete="off"
                            :disabled="invoice?.laf_status_id?.id != 10 && props.id"
                        />
                        <template v-if="$form.entity_name?.invalid">
                            <Message v-for="error of $form.entity_name.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.entity_name">
                            <Message v-for="errorMessage of backendErrors?.entity_name" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col gap-1 basis-[20%]">
                        <label for="invoice.entity_crn" class="first-letter:uppercase">{{ t('entity.attributes.crn') }}</label>
                        <InputText
                            id="invoice.entity_crn"
                            name="entity_crn"
                            type="text"
                            :invalid="!!backendErrors.entity_crn || $form.entity_crn?.invalid"
                            @focusin="delete backendErrors.entity_crn"
                            autocomplete="off"
                            :disabled="invoice?.laf_status_id?.id != 10 && props.id"
                        />
                        <template v-if="$form.entity_crn?.invalid">
                            <Message v-for="error of $form.entity_crn.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.entity_crn">
                            <Message v-for="errorMessage of backendErrors?.entity_crn" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>

                <div class="flex flex-row gap-4">
                    <div class="flex flex-col gap-1 basis-[40%]">
                        <label for="invoice.entity_address" class="first-letter:uppercase">{{ t('entity.attributes.address') }}</label>
                        <InputText id="invoice.entity_address" name="entity_address" type="text" :invalid="!!backendErrors.entity_address || $form.entity_address?.invalid" @focusin="delete backendErrors.entity_address" autocomplete="off" />
                        <template v-if="$form.entity_address?.invalid">
                            <Message v-for="error of $form.entity_address.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.entity_address">
                            <Message v-for="errorMessage of backendErrors?.entity_address" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col gap-1 basis-[20%]">
                        <label for="invoice.entity_population" class="first-letter:uppercase">{{ t('entity.attributes.population') }}</label>
                        <InputText
                            id="invoice.entity_population"
                            name="entity_population"
                            type="text"
                            :invalid="!!backendErrors.entity_population || $form.entity_population?.invalid"
                            @focusin="delete backendErrors.entity_population"
                            autocomplete="off"
                        />
                        <template v-if="$form.entity_population?.invalid">
                            <Message v-for="error of $form.entity_population.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.entity_population">
                            <Message v-for="errorMessage of backendErrors?.entity_population" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col gap-1 basis-[20%]">
                        <label for="invoice.entity_province" class="first-letter:uppercase">{{ t('entity.attributes.province') }}</label>
                        <InputText id="invoice.entity_province" name="entity_province" type="text" :invalid="!!backendErrors.entity_province || $form.entity_province?.invalid" @focusin="delete backendErrors.entity_province" autocomplete="off" />
                        <template v-if="$form.entity_province?.invalid">
                            <Message v-for="error of $form.entity_province.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.entity_province">
                            <Message v-for="errorMessage of backendErrors?.entity_province" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col gap-1 basis-[20%]">
                        <label for="invoice.entity_postal_code" class="first-letter:uppercase">{{ t('entity.attributes.postal_code') }}</label>
                        <InputText
                            id="invoice.entity_postal_code"
                            name="entity_postal_code"
                            type="text"
                            v-keyfilter.int
                            :invalid="!!backendErrors.entity_postal_code || $form.entity_postal_code?.invalid"
                            @focusin="delete backendErrors.entity_postal_code"
                            autocomplete="off"
                        />
                        <template v-if="$form.entity_postal_code?.invalid">
                            <Message v-for="error of $form.entity_postal_code.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.entity_postal_code">
                            <Message v-for="errorMessage of backendErrors?.entity_postal_code" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>

                <!-- Opciones de pago -->
                <div class="font-semibold text-xl mb-5 mt-5">Opciones de pago</div>

                <div class="flex flex-row gap-4">
                    <div class="flex flex-col gap-1 basis-1/2">
                        <label for="invoice.payment_methods_id" class="first-letter:uppercase">{{ t('invoice.attributes.payment_method_id') }}</label>
                        <Select
                            id="invoice.payment_methods_id"
                            name="payment_methods_id"
                            v-model="invoice.payment_methods_id"
                            :options="payment_methods"
                            option-value="id"
                            option-label="name"
                            :placeholder="loadingPaymentMethods ? t('invoice.payment_method.placeholder.loading') : t('invoice.payment_method.placeholder.single')"
                            :loading="loadingPaymentMethods"
                            :invalid="!!backendErrors.payment_methods_id || $form.payment_methods_id?.invalid"
                            @focus="delete backendErrors.payment_methods_id"
                        />
                        <template v-if="$form.payment_methods_id?.invalid">
                            <Message v-for="error of $form.payment_methods_id.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.payment_methods_id">
                            <Message v-for="errorMessage of backendErrors?.payment_methods_id" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col gap-1 basis-1/2">
                        <label for="invoice.paid_at" class="first-letter:uppercase">{{ t('invoice.attributes.paid_at') }}</label>
                        <DatePicker date-format="dd/mm/yy" :show-time="false" id="invoice.paid_at" name="paid_at" :invalid="!!backendErrors.paid_at || $form.paid_at?.invalid" @focusin="delete backendErrors.paid_at" autocomplete="off" show-icon />
                        <template v-if="$form.paid_at?.invalid">
                            <Message v-for="error of $form.paid_at.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.paid_at">
                            <Message v-for="errorMessage of backendErrors?.paid_at" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>

                <!-- Información general de la factura -->
                <div class="font-semibold text-xl mb-5 mt-5">Información general</div>

                <div class="flex flex-col gap-1">
                    <label for="invoice.sended_at" class="first-letter:uppercase">{{ t('invoice.attributes.sended_at') }}</label>
                    <DatePicker
                        date-format="dd/mm/yy"
                        :show-time="false"
                        id="invoice.sended_at"
                        name="sended_at"
                        :invalid="!!backendErrors.sended_at || $form.sended_at?.invalid"
                        @focusin="delete backendErrors.sended_at"
                        autocomplete="off"
                        show-icon
                    />
                    <template v-if="$form.sended_at?.invalid">
                        <Message v-for="error of $form.sended_at.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.sended_at">
                        <Message v-for="errorMessage of backendErrors?.sended_at" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>

                <div class="flex flex-col gap-1">
                    <label for="invoice.notes" class="first-letter:uppercase">{{ t('invoice.attributes.notes') }}</label>
                    <Textarea id="invoice.notes" name="notes" rows="3" :invalid="!!backendErrors.notes || $form.notes?.invalid" @focusin="delete backendErrors.notes" autocomplete="off" />
                    <template v-if="$form.notes?.invalid">
                        <Message v-for="error of $form.notes.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.notes">
                        <Message v-for="errorMessage of backendErrors?.notes" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
            </div>

            <template v-if="props.id">
                <InvoiceItemsTable :id="props.id" :is_draft="invoice?.laf_status_id?.id == 10 || invoice.laf_status_id == null ? true : false" />
            </template>

            <Button
                type="submit"
                :loading="submitting"
                :icon="$form.valid && !hasAdditionalErrors ? 'pi pi-check' : null"
                :label="t('invoice.save')"
                :title="!props.id ? t('invoice.store.title') : t('invoice.update.title')"
                :disabled="!$form.valid || hasAdditionalErrors || submitting"
            />
            <Button :label="t('common.buttons.cancel')" icon="pi pi-times" class="ml-2" severity="secondary" @click="cancel" :disabled="submitting" />
            <template v-if="props.id">
                <Button v-if="status_laf_officialize" :label="t('common.buttons.officialize')" icon="pi pi-file-check" class="ml-2" severity="success" @click="showDialogOfficialize = true" :disabled="submitting" />

                <Button v-if="status_laf_rectificative" label="Rectificar" icon="pi pi-file-check" class="ml-2" severity="danger" @click="showDialogRectificative = true" :disabled="submitting" />
            </template>
        </Form>
    </div>
    <Dialog
        v-model:visible="showDialogOfficialize"
        :header="capitalizeFirst(t('invoice.laf_status.officialize_action') + ' ' + t('invoice.laf_status.draft')) + ' ' + invoice.id"
        :modal="true"
        :style="{ width: '40vw' }"
        :breakpoints="{ '960px': '75vw', '640px': '95vw' }"
        @hide="showDialogOfficialize = false"
    >
        <OfficializeModal :id="props.id" @saved="saveOfficialize" @cancel="showDialogOfficialize = false" />
    </Dialog>
    <Dialog v-model:visible="showDialogRectificative" :header="t('invoice.laf_status.rectificative_action')" :modal="true" :style="{ width: '40vw' }" :breakpoints="{ '960px': '75vw', '640px': '95vw' }" @hide="showDialogRectificative = false">
        <ModalInvoiceRectificative :id="props.id" modal @saved="() => (showDialogRectificative = false)" @cancel="showDialogRectificative = false" />
    </Dialog>
</template>
