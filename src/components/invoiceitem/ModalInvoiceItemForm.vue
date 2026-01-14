<script setup>
import { onBeforeMount, ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import AppProgressSpinner from '@/layout/AppProgressSpinner.vue';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useI18n } from 'vue-i18n';
import { useSelectData } from '@/composables/useSelectData';
import { TaxTypesService } from '@/service/TaxTypesService';
import z from 'zod';
import { InvoiceItemService } from '@/service/InvoiceItemService';
import { calculatePrice, calculateTotal, createInvoiceItemFromApi, initialInvoiceItemState } from '@/clases/invoiceItem';
import { ServiceTypesService } from '@/service/ServiceTypesSercvice';


const toast = useToast();
const emit = defineEmits(['saved']);
const { t } = useI18n();

const props = defineProps({
    id_entity: { type: String, required: true, default: null },
});

const invoiceItem = ref({ ...initialInvoiceItemState});

const resolver = ref(
    zodResolver(
        z.object({
            service_type_id: z
                .number()
                .positive({ message: t('validation.required', { attribute: t('invoice_item.attributes.service_type_id') }) })
                .refine(id => ((services_types.value ?? []).map(service_type => service_type.id)).includes(id), {
                    message: t('validation.exists', { attribute: t('invoice_item.attributes.service_type_id') })
                }),
            description: z
                .string({ message: t('validation.required', { attribute: t('invoice_item.attributes.description') }) })
                .nullable(),
            price: z
                .number({ message: t('validation.required', { attribute: t('invoice_item.attributes.price') }) })
                .nonnegative({ message: t('validation.min.numeric', { attribute: t('invoice_item.attributes.price'), min: 0 }) }),
            discount_percentage: z
                .number()
                .nonnegative({ message: t('validation.required', { attribute: t('invoice_item.attributes.discount_percentage') }) })
                .lte(100, { message: t('validation.max.numeric', { attribute: t('invoice_item.attributes.discount_percentage'), max: 100 }) })
                .nullable(),
            surcharge_percentage: z
                .number({ message: t('validation.required', { attribute: t('invoice_item.attributes.surcharge_percentage') }) })
                .nonnegative({ message: t('validation.min.numeric', { attribute: t('invoice_item.attributes.surcharge_percentage'), min: 0 }) })
                .nullable(),
            tax_type_id: z
                .number()
                .positive({ message: t('validation.required', { attribute: t('invoice_item.attributes.tax_type_id') }) })
                .refine(id => ((taxs_types.value ?? []).map(tax_type => tax_type.id)).includes(id), {
                    message: t('validation.exists', { attribute: t('invoice_item.attributes.tax_type_id') })
                }),
        })
    )
);

const loadingErrors = ref([]);
const backendErrors = ref({});
const hasAdditionalErrors = computed(() => loadingErrors.value.length > 0 || Object.entries(backendErrors.value).length > 0);
const submitting = ref(false);
const loading = ref(false);
const refForm = ref(null);


const submit = async ({ valid, values}) => {
    if (!valid) {
        return;
    }
    submitting.value = true;

    try {
        const response = await InvoiceItemService.store({ ...values, invoice_id: props.id_entity });

        if (response.data?.invoice_item) {
            toast.add({
                severity: 'success',
                summary: t('invoice_item.store.success'),
                life: 3000
            });
            emit('saved', createInvoiceItemFromApi(response.data.invoice_item));
        }
    } catch (AxiosError) {
        if (AxiosError.response?.status === 422 && AxiosError.response?.data?.errors) {
            backendErrors.value = AxiosError.response.data.errors;
            submitting.value = false;
            return;
        }

        const error = {
            summary: t('invoice_item.store.error'),
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


const { items: taxs_types, loading: loadingTaxTypes, fetchData: fetchTaxTypes } = useSelectData(
    TaxTypesService.list,
    {
        toast,
        i18n: { t },
        errorMsgKey: 'invoice_item.tax_types.error',
        dataValue: 'tax_types'
    }
);
const { items: services_types, loading: loadingServicesTypes, fetchData: fetchServicesTypes  } = useSelectData(
    ServiceTypesService.list,
    {
        toast,
        i18n: { t },
        errorMsgKey: 'invoice_item.service_types.error',
        dataValue: 'service_types'
    }
);

onBeforeMount(() => {
    loading.value = true;
    fetchTaxTypes();
    fetchServicesTypes();
    loading.value = false;
});

watch(
    () => [
        invoiceItem.value.price,
        invoiceItem.value.discount_percentage,
        invoiceItem.value.surcharge_percentage,
        invoiceItem.value.tax_type_id
    ],
    (OldValue) => {
        if (refForm.value) {
            let total = calculateTotal(invoiceItem.value, taxs_types.value);
            refForm.value.setFieldValue('total', parseFloat(total.toFixed(2)) ?? OldValue);
        }
    }
);

watch(
    () => invoiceItem.value.total,
    () => {

        if (refForm.value) {
            let price = calculatePrice(invoiceItem.value, taxs_types.value);
            refForm.value.setFieldValue('price', parseFloat(price.toFixed(2)));
        }
    }
)
</script>

<template>
    <div v-if="loading" class="flex items-center w-full h-full">
        <AppProgressSpinner />
    </div>
    <div v-else>
        <Form ref="refForm" v-slot="$form" :initial-values="invoiceItem" :resolver="resolver" @submit="submit"
            class="space-y-4">
            <div v-if="hasAdditionalErrors" class="flex flex-col gap-2">
                <Message v-for="error of loadingErrors" :key="error" severity="error">
                    <div class="flex flex-col gap-1">
                        {{ error.summary }}
                        <small v-if="error.detail">{{ error.detail }}</small>
                    </div>
                </Message>
            </div>
            <div class="flex flex-col gap-4">
                <div class="flex flex-row gap-1">
                    <FloatLabel variant="in">
                        <InputText id="invoiceItem.description" name="description"
                            :invalid="!!(backendErrors.description || $form.description?.invalid)"
                            @focusin="delete backendErrors.description" showClear fluid autocomplete="off" />
                        <label for="invoiceItem.description" class="first-letter:uppercase">{{
                            t('invoice_item.attributes.description') }}</label>
                    </FloatLabel>
                    <template v-if="$form.description?.invalid">
                        <Message v-for="error of $form.description.errors" :key="error" severity="error" size="small"
                            variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.description">
                        <Message v-for="errorMessage of backendErrors?.description" :key="errorMessage" severity="error"
                            size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
                <div>
                    <FloatLabel variant="in">
                        <Select id="invoiceItem.service_type_id" name="service_type_id" v-model="invoiceItem.service_type_id"
                            :options="services_types" option-value="id" option-label="name"
                            :placeholder="loadingServicesTypes ? t('invoice_item.service_types.placeholder.loading') : t('invoice_item.service_types.placeholder.single')"
                            :loading="loadingServicesTypes"
                            :invalid="!!(backendErrors.service_type_id || $form.service_type_id?.invalid)"
                            @focus="delete backendErrors.service_type_id" class="w-full" />
                        <label for="invoiceItem.service_type_id" class="first-letter:uppercase">{{
                            t('invoice_item.attributes.service_type_id') }}</label>
                    </FloatLabel>
                    <template v-if="$form.service_type_id?.invalid">
                        <Message v-for="error of $form.service_type_id.errors" :key="error" severity="error"
                            size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.service_type_id">
                        <Message v-for="errorMessage of backendErrors?.tax_type_id" :key="errorMessage"
                            severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>

                <!-- Se pone me-4 para dejarlo alieneado -->
                <div class="grid grid-cols-1 md:grid-cols-[60%_40%] gap-4 me-4">
                    <div>
                        <InputGroup>
                            <FloatLabel variant="in">
                                <InputNumber 
                                    id="invoiceItem.price" name="price" v-model="invoiceItem.price"
                                    :invalid="!!(backendErrors.price || $form.price?.invalid)"
                                    @focusin="delete backendErrors.price" :min-fraction-digits="0"
                                    :max-fraction-digits="2" :min="0" autocomplete="off" />
                                <label for="invoiceItem.price" class="first-letter:uppercase">{{
                                    t('invoice_item.attributes.price')
                                    }}</label>
                            </FloatLabel>
                            <InputGroupAddon>€</InputGroupAddon>
                        </InputGroup>
                        <template v-if="$form.price?.invalid">
                            <Message v-for="error of $form.price.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.price">
                            <Message v-for="errorMessage of backendErrors?.price" :key="errorMessage" severity="error"
                                size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                    <!-- Se pone me-4 para dejarlo alieneado y class="w-full" al select para que no cambie de tamaño  -->
                    <div>
                        <FloatLabel variant="in">
                            <Select id="invoiceItem.tax_type_id" name="tax_type_id" v-model="invoiceItem.tax_type_id"
                                :options="taxs_types" option-value="id" option-label="name"
                                :placeholder="loadingTaxTypes ? t('invoice_item.tax_types.placeholder.loading') : t('invoice_item.tax_types.placeholder.single')"
                                :loading="loadingTaxTypes"
                                :invalid="!!(backendErrors.tax_type_id || $form.tax_type_id?.invalid)"
                                @focus="delete backendErrors.tax_type_id" class="w-full" />
                            <label for="invoiceItem.tax_type_id" class="first-letter:uppercase">{{
                                t('invoice_item.attributes.tax_type_id') }}</label>
                        </FloatLabel>
                        <template v-if="$form.tax_type_id?.invalid">
                            <Message v-for="error of $form.tax_type_id.errors" :key="error" severity="error"
                                size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.tax_type_id">
                            <Message v-for="errorMessage of backendErrors?.tax_type_id" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-[50%_50%] gap-4 me-4">
                    <div>
                        <InputGroup>
                            <FloatLabel variant="in">
                                <InputNumber id="invoiceItem.discount_percentage" name="discount_percentage"
                                    v-model="invoiceItem.discount_percentage"
                                    :invalid="!!(backendErrors.discount_percentage || $form.discount_percentage?.invalid)"
                                    @focusin="delete backendErrors.discount_percentage" :max-fraction-digits="0"
                                    :min="0" :max="100" autocomplete="off" />
                                <label for="invoiceItem.discount_percentage" class="first-letter:uppercase">{{
                                    t('invoice_item.attributes.discount_percentage') }}</label>
                            </FloatLabel>
                            <InputGroupAddon>%</InputGroupAddon>
                        </InputGroup>
                        <template v-if="$form.discount_percentage?.invalid">
                            <Message v-for="error of $form.discount_percentage.errors" :key="error" severity="error"
                                size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.discount_percentage">
                            <Message v-for="errorMessage of backendErrors?.discount_percentage" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                    <div>
                        <InputGroup>
                            <FloatLabel variant="in">
                                <InputNumber id="invoiceItem.surcharge_percentage" name="surcharge_percentage"
                                    v-model="invoiceItem.surcharge_percentage"
                                    :invalid="!!(backendErrors.surcharge_percentage || $form.surcharge_percentage?.invalid)"
                                    @focusin="delete backendErrors.surcharge_percentage" :max-fraction-digits="0"
                                    :min="0" autocomplete="off" />
                                <label for="invoiceItem.surcharge_percentage" class="first-letter:uppercase">{{
                                    t('invoice_item.attributes.surcharge_percentage') }}</label>
                            </FloatLabel>
                            <InputGroupAddon>%</InputGroupAddon>
                        </InputGroup>
                        <template v-if="$form.surcharge_percentage?.invalid">
                            <Message v-for="error of $form.surcharge_percentage.errors" :key="error" severity="error"
                                size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.surcharge_percentage">
                            <Message v-for="errorMessage of backendErrors?.surcharge_percentage" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>
                <div class="flex flex-col gap-4">
                    <InputGroup>
                        <FloatLabel variant="in">
                            <InputNumber id="invoiceItem.total" name="total" v-model="invoiceItem.total"
                                :invalid="!!(backendErrors.total || $form.total?.invalid)"
                                @focusin="delete backendErrors.total" :min-fraction-digits="0" :max-fraction-digits="2"
                                :min="0" autocomplete="off" />
                            <label for="invoiceItem.total" class="first-letter:uppercase">{{
                                t('invoice_item.attributes.total')
                                }}</label>
                        </FloatLabel>
                        <InputGroupAddon>€</InputGroupAddon>
                    </InputGroup>
                    <template v-if="$form.total?.invalid">
                        <Message v-for="error of $form.total.errors" :key="error" severity="error" size="small"
                            variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.total">
                        <Message v-for="errorMessage of backendErrors?.total" :key="errorMessage" severity="error"
                            size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
            </div>

            <Button type="submit" :loading="submitting"
                :icon="$form.valid && !hasAdditionalErrors ? 'pi pi-check' : null" :label="t('invoice_item.save')"
                :disabled="!$form.valid || hasAdditionalErrors || submitting || loading"
                :title="t('invoice_item.store.title')" />
        </Form>
    </div>
</template>
