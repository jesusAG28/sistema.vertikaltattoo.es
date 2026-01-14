<script setup>
import { useSettingsStore } from '@/stores/settings';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { FilterMatchMode } from '@primevue/core/api';
import { useConfirm, useToast } from 'primevue';
import { useLoadingStore } from '@/stores/loading';
import { InvoiceItemService } from '@/service/InvoiceItemService';
import ModalInvoiceItemForm from '../invoiceitem/ModalInvoiceItemForm.vue';
import { useSelectData } from '@/composables/useSelectData';
import { TaxTypesService } from '@/service/TaxTypesService';
import { calculatePrice, calculateTotal, createInvoiceItemFromApi, getInvoiceItemSchema } from '@/clases/invoiceItem';
import { ServiceTypesService } from '@/service/ServiceTypesSercvice';


const { t } = useI18n();
const toast = useToast();
const settingsStore = useSettingsStore();

const emit = defineEmits(['update:loading']);

const loading = ref(false);
const error = ref(false);
const dt = ref(null);
const rows = ref(settingsStore.dataTable.rows);
const rowsPerPageOptions = ref(settingsStore.dataTable.rowsPerPageOptions);
const invoiceLines = ref([]);
const loadingErrors = ref([]);
const formErrors = ref([]);
const editingRows = ref(new Array());
const pt = { mask: { style: { '--p-mask-background': 'transparent' } }, column: { columnTitle: { class: 'p-datatable-column-title first-letter:uppercase' } } };
const backendErrors = ref({});
const hasAdditionalErrors = computed(() => loadingErrors.value.length > 0 || Object.entries(backendErrors.value).length > 0);

const props = defineProps({
    id: {
        type: String,
        required: true,
        default: null
    },
    is_draft: {
        type: Boolean,
        required: true,
    }
});

const sumTotal = computed(() => {
    if (!invoiceLines.value) {
        return 0;
    }

    return invoiceLines.value.reduce((accumulator, currentLine) => {
        return accumulator + parseFloat(currentLine.total || 0);
    }, 0);
});

const sumPrice = computed(() => {
    if (!invoiceLines.value) {
        return 0;
    }

    return invoiceLines.value.reduce((accumulator, currentLine) => {
        return accumulator + parseFloat(currentLine.price || 0);
    }, 0);
})

const formattedsumTotal = computed(() => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(sumTotal.value);
});

const formattedsumPrice = computed(() => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(sumPrice.value);
})


onBeforeMount(() => {
    initDatatableFilters();
    fetch();
    fetchTaxTypes();
    fetchServicesTypes();
});

const { items: taxs_types, loading: loadingTaxTypes, fetchData: fetchTaxTypes} = useSelectData(
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

const resolver = ref(getInvoiceItemSchema(t));

const fetch = async () => {
    loading.value = true;
    emit('update:loading', true);

    try {
        const response = await InvoiceItemService.search({ invoice_id: props.id });

        if (response.data?.invoice_items) {
            invoiceLines.value = response.data.invoice_items
                .map((invoiceItem) =>createInvoiceItemFromApi(invoiceItem));
        }

        if (error.value) {
            error.value = false;
        }

    } catch (AxiosError) {
        error.value = true;
    }

    emit('update:loading', false);
    loading.value = false;
};


const datatableFilters = ref();
const getDatatableInitialFilters = () => {
    return { global: {value: null, matchMode: FilterMatchMode.CONTAINS} }
};

const initDatatableFilters = () => {
    datatableFilters.value = getDatatableInitialFilters();
};

const clearDatatableFilter = (filter) => {
    const initialFilters = getDatatableInitialFilters();

    datatableFilters.value[filter].value = initialFilters[filter].value;
};


const confirmDeletePopup = useConfirm();


function confirmDelete(event, id) {
    confirmDeletePopup.require({
        target: event.target,
        message: t('invoice_item.delete.confirm.message'),
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: t('invoice_item.delete.confirm.reject'),
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            icon: 'pi pi-trash',
            severity: 'danger'
        },
        accept: async () => {
            const loadingStore = useLoadingStore();

            loadingStore.loading = true;

            try {
                await InvoiceItemService.delete(id);

                toast.add({ severity: 'success', summary: t('invoice_item.delete.success', { id }), life: 3000 });
            } catch (AxiosError) {
                toast.add({ severity: 'error', summary: t('invoice_item.delete.error', { id }), life: 3000 });
            }

            loadingStore.loading = false;

            fetch();
        },
        reject: () => {
            return;
        }
    });
}

const modalVisible = ref(false);
function getInvoiceItem(invoice_item) {
    if(invoice_item){
        invoiceLines.value.push(invoice_item);
        modalVisible.value = false;
    }
}

defineExpose({ fetch });

const onRowEditSave = async (event) => {
    const { newData, index } = event;
        
    const valuesValidated = resolver.value.safeParse(newData);

    if(valuesValidated.success){
        try{
            editingRows.value.push(newData);
            newData.invoice_id = newData.invoice_id?.id ?? newData.invoice_id;
            const response = await InvoiceItemService.update(newData.id , newData);
            

            if (response.data) {
                editingRows.value = editingRows.value.filter(row => row !== newData);
                invoiceLines.value[index] = createInvoiceItemFromApi(response.data.invoice_items);
                toast.add({
                    severity: 'success',
                    summary: !props.id ? t('invoice_item.store.success') : t('invoice_item.update.success', { id: props.id }),
                    life: 3000
                });
            }
        }catch(AxiosError){
            console.log(AxiosError);
            
            if (AxiosError.response?.status === 422 && AxiosError.response?.data?.errors) {
                backendErrors.value = AxiosError.response.data.errors;
                return;
            }

            const error = {
                summary: !props.id ? t('invoice_item.store.error') : t('invoice_item.update.error', { id: props.id })
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
    }else{
        const errors = valuesValidated.error.flatten();
        formErrors.value[index] = errors.fieldErrors;
        editingRows.value.push(newData);
    }
}

const calculateTotalInvoiceItem = (slotProps) => {    
    if(!slotProps)
        return
    
    slotProps.data.total =  calculateTotal(slotProps?.data, taxs_types.value);
}

const calculatePriceInvoiceItem = (slotProps) => {
    if(!slotProps)
        return

    slotProps.data.price =  calculatePrice(slotProps.data, taxs_types.value);
}
</script>

<template>
    <div class="space-y-4">
        <div>
            <div class="font-semibold text-xl mb-4">Líneas de factura</div>
                <DataTable
                    ref="dt"
                    v-model:value="invoiceLines"
                    v-model:editing-rows="editingRows"
                    data-key="id"
                    :filters="datatableFilters"
                    removableSort
                    :loading="loading || error"
                    :pt="pt"
                    scrollable
                    editMode="row"
                    size="large"
                    @row-edit-save="onRowEditSave($event)"
                >
                    <template #loading />
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" :title="t('invoice_item.search')" />
                                </InputIcon>
                                <InputText v-model="datatableFilters['global'].value" :placeholder="t('invoice_item.datatable.filters.search')" />
                                <InputIcon>
                                    <i class="pi pi-times" @click="clearDatatableFilter('global')" />
                                </InputIcon>
                            </IconField>

                            <Button v-if="is_draft" icon="pi pi-plus" :title="t('invoice_item.store.title')" @click="modalVisible = true" />

                            <Dialog v-model:visible="modalVisible" modal header="Crear nuevo linea de factura" :style="{ width: '45vw' }" :breakpoints="{ '960px': '75vw', '640px': '95vw' }">
                                <ModalInvoiceItemForm
                                    :id_entity="props.id"
                                    @saved="getInvoiceItem"
                                />
                            </Dialog>
                        </div>
                    </template>
                    <template #empty>{{ t('invoice_item.datatable.empty') }}</template>

                    <Column field="description" :header="t('invoice_item.attributes.description')" sortable style="min-width: 15rem">
                        <template v-if="loading || error" #body>
                            <Skeleton v-if="loading || error" style="width: 75%" />
                        </template>

                        <template v-else #editor="slotProps">
                            <InputText 
                                v-model="slotProps.data[slotProps.field]" 
                                fluid
                                :invalid="!!(backendErrors[slotProps.index]?.description || formErrors[slotProps.index]?.description)"
                                @focusin="delete backendErrors.description; delete formErrors[slotProps.index]?.description"
                                showClear
                                autocomplete="off"
                            />
                            <div v-if="formErrors[slotProps.index]?.description">
                                <Message v-for="errorMessage of formErrors[slotProps.index]?.description" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                            </div>
                            <div v-if="backendErrors?.description">
                                <Message v-for="errorMessage of backendErrors?.description" :key="errorMessage" severity="error"
                                    size="small" variant="simple">{{ errorMessage }}</Message>
                            </div>
                        </template>
                    </Column>

                    <Column field="service_type_id" :header="t('invoice_item.attributes.service_type_id')" sortable style="min-width: 8rem">
                        <template v-if="loading || error" #loading>
                            <Skeleton style="width: 75%" />
                        </template>
                        <template v-else #body="slotProps">
                            <span>{{ slotProps.data?.service_type?.name  ?? "Sin Servicio" }}</span>
                        </template>
                        <template  #editor="slotProps">
                              <Select
                                id="invoiceItem.service_type_id"
                                name="service_type_id"
                                v-model="slotProps.data[slotProps.field]"
                                :options="services_types"
                                option-value="id"
                                option-label="name"
                                :placeholder="loadingServicesTypes ? t('invoice_item.service_types.placeholder.loading') : t('invoice_item.service_types.placeholder.single')"
                                :loading="loadingServicesTypes"
                                :invalid="!!(backendErrors[slotProps.index]?.service_type_id || formErrors[slotProps.index]?.service_type_id)"
                                @focusin="delete backendErrors[slotProps.index]?.service_type_id; delete formErrors[slotProps.index]?.service_type_id"
                                class="w-full"
                            />
                            <div v-if="formErrors[slotProps.index]?.service_type_id">
                                <Message v-for="errorMessage of formErrors[slotProps.index]?.service_type_id" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                            </div>
                            <div v-if="backendErrors[slotProps.index]?.service_type_id">
                                <Message v-for="errorMessage of backendErrors[slotProps.index]?.service_type_id" :key="errorMessage" severity="error"
                                    size="small" variant="simple">{{ errorMessage }}</Message>
                            </div>
                        </template>
                        <template #footer>
                            <span class="font-bold text-right w-full block">{{ t('invoice_item.attributes.net_subtotal') }}:</span>
                        </template>
                    </Column>

                    <Column field="price" :header="t('invoice_item.attributes.price')" sortable style="min-width: 10rem">
                        <template v-if="loading || error" #body>
                            <Skeleton style="width: 75%" />
                        </template>
                        <template v-else #body="slotProps">
                            <span> 
                               {{ !isNaN(parseFloat(slotProps.data?.price))
                                    ? parseFloat(slotProps.data.price).toFixed(2) + ' €'
                                    : 'Sin precio' }}
                            </span>
                        </template>
                        <template #editor="slotProps">
                            <InputGroup>
                                <InputNumber
                                    v-model="slotProps.data[slotProps.field]" 
                                    fluid
                                    :invalid="!!(backendErrors[slotProps.index]?.price || formErrors[slotProps.index]?.price)"
                                    @focusin="delete backendErrors[slotProps.index]?.price; delete formErrors[slotProps.index]?.price"
                                    :min-fraction-digits="0"
                                    :max-fraction-digits="2"
                                    :min="0"
                                    autocomplete="off"
                                    @update:model-value="calculateTotalInvoiceItem(slotProps)"
                                />
                                <InputGroupAddon>€</InputGroupAddon>
                            </InputGroup>
                            
                            <div v-if="formErrors[slotProps.index]?.price">
                                <Message v-for="errorMessage of formErrors[slotProps.index]?.price" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                            </div>
                            <div v-if="backendErrors?.price">
                                <Message v-for="errorMessage of backendErrors?.price" :key="errorMessage" severity="error"
                                    size="small" variant="simple">{{ errorMessage }}</Message>
                            </div>
                        </template>
                        <template #footer>
                            <span class="font-bold">{{ formattedsumPrice }}</span>
                        </template>
                    </Column>

                    <Column field="discount_percentage" :header="t('invoice_item.attributes.discount_percentage')" sortable style="min-width: 5rem">
                        <template v-if="loading || error" #body>
                            <Skeleton style="width: 75%" />
                        </template>
                        <template v-else #body="slotProps">
                            <span> 
                                {{ slotProps.data?.discount_percentage != null
                                    ? slotProps.data.discount_percentage + '%'
                                    : 'Sin descuento' }}
                            </span>
                        </template>
                        <template #editor="slotProps">
                            <InputGroup>
                                <InputNumber 
                                    v-model="slotProps.data[slotProps.field]" 
                                    fluid 
                                    :invalid="!!(backendErrors[slotProps.index]?.discount_percentage || formErrors[slotProps.index]?.discount_percentage)"
                                    @focusin="delete backendErrors[slotProps.index]?.discount_percentage; delete formErrors[slotProps.index]?.discount_percentage"
                                    :min="0"
                                    :max="100"
                                    autocomplete="off" 
                                    @update:model-value="calculateTotalInvoiceItem(slotProps)"
                                />
                                <InputGroupAddon>%</InputGroupAddon>
                            </InputGroup>
                            <div v-if="formErrors[slotProps.index]?.discount_percentage">
                                <Message v-for="errorMessage of formErrors[slotProps.index]?.discount_percentage" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                            </div>
                            <div v-if="backendErrors[slotProps.index]?.discount_percentage">
                                <Message v-for="errorMessage of backendErrors[slotProps.index]?.discount_percentage" :key="errorMessage" severity="error"
                                    size="small" variant="simple">{{ errorMessage }}</Message>
                            </div>
                        </template>
                    </Column>

                    <Column field="surcharge_percentage" :header="t('invoice_item.attributes.surcharge_percentage')" sortable style="min-width: 5rem">
                        <template v-if="loading || error" #loading>
                            <Skeleton style="width: 75%" />
                        </template>
                        <template v-else #body="slotProps">
                            <span> 
                                {{ slotProps.data?.surcharge_percentage != null
                                    ? slotProps.data.surcharge_percentage + '%'
                                    : 'Sin recargo' }}
                            </span>
                        </template>
                        <template #editor="slotProps" >
                            <InputGroup>
                                <InputNumber 
                                    v-model="slotProps.data[slotProps.field]" 
                                    fluid 
                                    :invalid="!!(backendErrors[slotProps.index]?.surcharge_percentage || formErrors[slotProps.index]?.surcharge_percentage)"
                                    @focusin="delete backendErrors[slotProps.index]?.surcharge_percentage; delete formErrors[slotProps.index]?.surcharge_percentage"
                                    :min="0"
                                    autocomplete="off"
                                    @update:model-value="calculateTotalInvoiceItem(slotProps)"
                                />
                                <InputGroupAddon>%</InputGroupAddon>
                            </InputGroup>
                            <div v-if="formErrors[slotProps.index]?.surcharge_percentage">
                                <Message 
                                    v-for="errorMessage of formErrors[slotProps.index]?.surcharge_percentage" 
                                    :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                            </div>
                            <div v-if="backendErrors[slotProps.index]?.surcharge_percentage">
                                <Message v-for="errorMessage of backendErrors[slotProps.index]?.surcharge_percentage" :key="errorMessage" severity="error"
                                    size="small" variant="simple">{{ errorMessage }}</Message>
                            </div>
                        </template>
                    </Column>

                    <Column field="tax_type_id" :header="t('invoice_item.attributes.tax_type_id')" sortable style="min-width: 8rem">
                        <template v-if="loading || error" #loading>
                            <Skeleton style="width: 75%" />
                        </template>
                        <template v-else #body="slotProps">
                            <span>{{ slotProps.data?.tax_type?.rate  ?? "Sin IVA" }}</span>
                        </template>
                        <template  #editor="slotProps">
                              <Select
                                id="invoiceItem.tax_type_id"
                                name="tax_type_id"
                                v-model="slotProps.data[slotProps.field]"
                                :options="taxs_types"
                                option-value="id"
                                option-label="name"
                                :placeholder="loadingTaxTypes ? t('invoice_item.tax_types.placeholder.loading') : t('invoice_item.tax_types.placeholder.single')"
                                :loading="loadingTaxTypes"
                                :invalid="!!(backendErrors[slotProps.index]?.tax_type_id || formErrors[slotProps.index]?.tax_type_id)"
                                @focusin="delete backendErrors[slotProps.index]?.tax_type_id; delete formErrors[slotProps.index]?.tax_type_id"
                                class="w-full"
                                @update:model-value="calculateTotalInvoiceItem(slotProps)"
                            />
                            <div v-if="formErrors[slotProps.index]?.tax_type_id">
                                <Message v-for="errorMessage of formErrors[slotProps.index]?.tax_type_id" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                            </div>
                            <div v-if="backendErrors[slotProps.index]?.tax_type_id">
                                <Message v-for="errorMessage of backendErrors[slotProps.index]?.tax_type_id" :key="errorMessage" severity="error"
                                    size="small" variant="simple">{{ errorMessage }}</Message>
                            </div>
                        </template>
                        <template #footer>
                            <span class="font-bold text-right w-full block">Total:</span>
                        </template>
                    </Column>

                    <Column field="total" :header="t('invoice_item.attributes.total')" sortable style="min-width: 10rem">
                        <template v-if="loading || error" #body>
                            <Skeleton style="width: 75%" />
                        </template>
                        <template v-else #body="slotProps">
                            <span> 
                                {{ !isNaN(parseFloat(slotProps.data?.total))
                                    ? parseFloat(slotProps.data.total).toFixed(2) + ' €'
                                    : 'Sin total' }}
                            </span>
                        </template>
                        <template #editor="slotProps">
                            <InputGroup>
                                <InputNumber 
                                    v-model="slotProps.data[slotProps.field]"
                                    fluid
                                    :invalid="!!(backendErrors[slotProps.index]?.total || formErrors[slotProps.index]?.total)"
                                    @focusin="delete backendErrors[slotProps.index]?.total; delete formErrors[slotProps.index]?.total"
                                    :min-fraction-digits="0"
                                    :max-fraction-digits="2"
                                    :min="0"
                                    autocomplete="off"
                                    @update:model-value="calculatePriceInvoiceItem(slotProps)" 
                                />
                                <InputGroupAddon>€</InputGroupAddon>
                            </InputGroup>
                            
                            <div v-if="formErrors[slotProps.index]?.total">
                                <Message v-for="errorMessage of formErrors[slotProps.index]?.total" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                            </div>
                            <template v-if="backendErrors[slotProps.index]?.total">
                                <Message v-for="errorMessage of backendErrors[slotProps.index]?.total" :key="errorMessage" severity="error"
                                    size="small" variant="simple">{{ errorMessage }}</Message>
                             </template>
                        </template>
                        <template #footer>
                            <span class="font-bold">{{ formattedsumTotal }}</span>
                        </template>
                    </Column>

                    <Column v-if="is_draft" :exportable="false" :rowEditor="true" :header="t('invoice_item.actions')" frozen style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil":disabled="!slotProps.data?.id" severity="secondary" text @click="slotProps.editorInitCallback" />
                            <Button icon="pi pi-trash" :disabled="!slotProps.data?.id" severity="danger" ref="popup" text :title="t('invoice_item.delete.title')" @click="confirmDelete($event, slotProps.data.id)" />
                            <ConfirmPopup />
                        </template>
                        <template #editor="slotProps">
                            <Button icon="pi pi-check" text rounded @click="slotProps.editorSaveCallback" />
                            <Button icon="pi pi-times" severity="danger" text rounded @click="slotProps.editorCancelCallback" />
                        </template>
                    </Column>
                </DataTable>
        </div>
    </div>
</template>