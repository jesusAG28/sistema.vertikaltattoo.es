<script setup>
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/stores/settings';
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useConfirm, useToast } from 'primevue';
import Dialog from 'primevue/dialog';
import { useLoadingStore } from '@/stores/loading';
import { InvoiceService } from '@/service/InvoiceService';
import { createInvoiceFromApi } from '@/clases/invoice';
import { DateService } from '@/service/DateService';
import { DataTableFiltersService } from '@/service/DataTableFiltersService';
import { useAuthStore } from '@/stores/auth';
import { translateQueryFilters } from '@/service/QueryFiltersService';
import AppliedFilters from '../ui/AppliedFilters.vue';
import { LAFStatusService } from '@/service/LAFStatusService';
import { EntityService } from '@/service/EntityService';
import { createEntityFromApi } from '@/clases/entity';
import { useSelectData } from '@/composables/useSelectData';
import { SerieService } from '@/service/SerieService';

const { t } = useI18n();
const settingsStore = useSettingsStore();

const loading = ref(false);
const error = ref(false);
const invoicesSelected = ref([]);

const rows = ref(settingsStore.dataTable.rows);
const rowsPerPageOptions = ref(settingsStore.dataTable.rowsPerPageOptions);
const invoices = ref(new Array(rows.value));
const dt = ref(null);
const pt = {
    mask: { style: { '--p-mask-background': 'transparent' } },
    column: { columnTitle: { class: 'p-datatable-column-title first-letter:uppercase' } }
};

const fetch = async (queryFilterValues = []) => {
    loading.value = true;

    try {
        const response = await (queryFilterValues.length === 0 ? InvoiceService.list() : InvoiceService.search(queryFilterValues));

        if (response.data?.invoices) {
            invoices.value = response.data.invoices.map((invoice) => createInvoiceFromApi(invoice));
        }

        if (error.value) {
            error.value = false;
        }
    } catch (AxiosError) {
        error.value = true;
    }

    loading.value = false;
};

const toast = useToast();
const confirmDeletePopup = useConfirm();

function confirmDelete(event, id) {
    confirmDeletePopup.require({
        target: event.target,
        message: t('invoice.delete.confirm.message'),
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: t('invoice.delete.confirm.reject'),
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
                await InvoiceService.delete(id);

                toast.add({
                    severity: 'success',
                    summary: t('invoice.delete.success', { id }),
                    life: 3000
                });
            } catch (AxiosError) {
                toast.add({
                    severity: 'error',
                    summary: t('invoice.delete.error', { id }),
                    life: 3000
                });
            }
            loadingStore.loading = false;

            fetch();
        },
        reject: () => {
            return;
        }
    });
}

function colorTag(slotProps) {
    let laf_status_id = slotProps.data?.laf_status_id?.id;
    let severity = laf_status_id == 1 ? 'success' : laf_status_id == 2 ? 'danger' : 'warn';
    return severity;
}

const makePdfsToInvoicesSelected = () => {
    invoicesSelected.value.forEach((invoice) => makePdf(invoice));
};

const sendEmailsToInvoicesSelected = () => {
    invoicesSelected.value.forEach((invoice) => sendEmail(invoice));
};

const makePdf = async (id) => {
    console.log('make pdfs');
    try {
        let response = await InvoiceService.print(id);

        if (response.data?.pdf) {
            window.open(response.data.pdf, '_blank');
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('invoice.make_pdf.error'),
            life: 3000
        });
    }
};

const sendEmail = async (id) => {
    console.log('send emails');

    try {
        let response = await InvoiceService.send(id);

        if (response.data?.success) {
            toast.add({
                severity: 'success',
                summary: t('invoice.send_email.success'),
                life: 3000
            });
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('invoice.send_email.error'),
            life: 3000
        });
    }
};

const baseUrl = import.meta.env.VITE_API_URL;
const uploadUrl = computed(() => `${baseUrl}/invoices/uploadCSV`);
const csvUpload = ref(null);

const beforeSend = ({ xhr }) => {
    const authStore = useAuthStore();

    if (authStore.user?.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${authStore.user.token}`);
    }
};

const showErrorCSV = ({ xhr }) => {
    console.log('Status :' + xhr.status);

    console.log('Response:' + xhr.response);
    toast.add({ severity: 'error', summary: t('invoice.import_csv.error'), life: 3000 });
};

const selectCSV = (event) => {
    const file = event.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
        console.error('Archivo no permitido. Solo se aceptan CSV.');
        toast.add({ severity: 'error', summary: t('invoice.import_csv.error_format'), life: 3000 });
        csvUpload.value.clear();
        return;
    }
};

const successCSV = ({ xhr }) => {
    let successObject = null;

    try {
        successObject = JSON.parse(xhr.response);
    } catch (error) {
        console.log(error);
    }

    toast.add({ severity: 'success', summary: successObject?.message ?? t('invoice.import_csv.success'), life: 3000 });
    fetch();
};

const showServiceInvoicesDialog = ref(false);
const templateUpload = ref(null);
const downloadingTemplate = ref(false);

const showServicesInvoicePopup = () => {
    showServiceInvoicesDialog.value = true;
};

// const templateUploadUrl = computed(() => `${baseUrl}/invoices/uploadTemplate`);

const downloadSuppliesTemplate = async () => {
    downloadingTemplate.value = true;
    try {
        const response = await InvoiceService.downloadSuppliesTemplate();

        if (response.data?.url) {
            const link = document.createElement('a');
            link.href = response.data.url;
            link.setAttribute('download', '');
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);
            link.click();
            link.remove();
        }

        toast.add({
            severity: 'success',
            summary: t('download_template.success'),
            life: 3000
        });
    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: t('download_template.error'),
            life: 3000
        });
    } finally {
        downloadingTemplate.value = false;
    }
};

const uploadSuppliesTemplate = async (event) => {
    const file = event.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.add({
            severity: 'error',
            summary: 'Error de formato',
            detail: 'El archivo debe ser de tipo Excel (.xlsx o .xls)',
            life: 3000
        });
        templateUpload.value.clear();
        return;
    }

    const loadingStore = useLoadingStore();
    loadingStore.loading = true;

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await InvoiceService.uploadSuppliesTemplate(formData);

        toast.add({
            severity: 'success',
            summary: response.data?.message ?? 'Plantilla de suministros procesada correctamente',
            life: 3000
        });

        showServiceInvoicesDialog.value = false;
        templateUpload.value.clear();
        fetch();
    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Error procesando la plantilla de suministros',
            detail: error.response?.data?.message,
            life: 3000
        });
    } finally {
        loadingStore.loading = false;
    }
};

const initialQueryFilters = ref(InvoiceService.getInitialFilterValues());
const appliedQueryFilters = ref(translateQueryFilters(InvoiceService.getInitialFilterValues(), 'invoice.attributes'));

const laf_status_select = ref(null);
const {
    items: laf_statuses,
    loading: filterLAFStatuesLoading,
    fetchData: fetchLAFStatuesFilterData
} = useSelectData(LAFStatusService.list, {
    toast,
    i18n: { t },
    errorMsgKey: 'invoice.laf_status.error',
    dataValue: 'laf_statuses'
});

const {
    items: series,
    loading: filterSeriesLoading,
    fetchData: fetchSeriesFilterData
} = useSelectData(SerieService.list, {
    toast,
    i18n: { t },
    errorMsgKey: 'invoice.serie.error',
    dataValue: 'series'
});

const entities = ref([]);
const filterEntitiesLoading = ref(false);

const fetchEntitiesFilterData = async () => {
    filterEntitiesLoading.value = true;

    try {
        const response = await EntityService.search();

        if (response.data?.entities) {
            entities.value = response.data.entities.map((entity) => createEntityFromApi(entity));
        }
    } catch (AxiosError) {
        toast.add({
            severity: 'error',
            summary: t('invoice.entity.error'),
            detail: AxiosError.response?.data?.message,
            life: 3000
        });
    }

    filterEntitiesLoading.value = false;
};

const search = ({ valid, values }) => {
    if (!valid) {
        return;
    }

    if (values.date_start) {
        values.date_start = DateService.date.toPayloadFormat(values.date_start);
    }

    if (values.date_end) {
        values.date_end = DateService.date.toPayloadFormat(values.date_end);
    }

    appliedQueryFilters.value = translateQueryFilters(values, 'invoice.attributes');

    values.laf_status_id = values?.laf_status_id?.id ?? null;
    values.serie_id = values?.serie_id?.id ?? null;

    fetch(values);
};

const datatableFilters = ref();
onBeforeMount(() => {
    fetch();
    datatableFilters.value = DataTableFiltersService.initDatatableFilters([fetchEntitiesFilterData(), fetchLAFStatuesFilterData(), fetchSeriesFilterData()]);
});

const refForm = ref(null);
watch(
    laf_status_select,
    () => {
        if (refForm.value) {
            refForm.value.setFieldValue('date_start', null);
            refForm.value.setFieldValue('date_end', null);
            refForm.value.setFieldValue('serie_id', null);
            refForm.value.setFieldValue('number', null);
        }
    },
    { deep: true }
);
</script>
<template>
    <div class="space-y-4">
        <div class="card space-y-4">
            <Form ref="refForm" v-slot="$form" :initial-values="initialQueryFilters" @submit="search" class="space-y-4">
                <Fluid>
                    <div class="grid grid-cols-none sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        <div class="flex flex-col gap-1">
                            <label for="invoice.filter.laf_status_id" class="first-letter:uppercase">{{ t('invoice.attributes.laf_status') }}</label>
                            <Select
                                v-model="laf_status_select"
                                name="laf_status_id"
                                :options="laf_statuses"
                                option-label="name"
                                :placeholder="filterLAFStatuesLoading ? t('invoice.laf_status.placeholder.loading') : t('invoice.laf_status.placeholder.multiple')"
                                :loading="filterLAFStatuesLoading"
                                showClear
                            />
                            <template v-if="$form.laf_status_id?.invalid">
                                <Message v-for="error of $form.laf_status.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label for="invoice.filter.entity_id" class="first-letter:uppercase">{{ t('invoice.attributes.entity') }}</label>
                            <MultiSelect
                                name="entity_id"
                                :options="entities"
                                option-label="name"
                                display="chip"
                                :placeholder="filterEntitiesLoading ? t('invoice.entity.placeholder.loading') : t('invoice.entity.placeholder.multiple')"
                                :filter="true"
                                :loading="filterEntitiesLoading"
                            />
                            <template v-if="$form.entity?.invalid">
                                <Message v-for="error of $form.subscription.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>

                        <div v-show="laf_status_select?.id != 10" class="flex flex-col gap-1">
                            <label for="invoice.filter.serie" class="first-letter:uppercase">{{ t('invoice.attributes.full_number') }}</label>
                            <div class="grid grid-cols-[35%_65%] gap-0">
                                <div class="flex flex-col">
                                    <Select
                                        name="serie_id"
                                        :options="series"
                                        option-label="name"
                                        :placeholder="filterLAFStatuesLoading ? t('invoice.serie.placeholder.loading') : t('invoice.serie.placeholder.multiple')"
                                        :loading="filterSeriesLoading"
                                        showClear
                                    />
                                </div>
                                <div class="flex flex-col">
                                    <InputNumber name="number" :max-fraction-digits="0" :min="0" autocomplete="off" />
                                </div>
                            </div>

                            <template v-if="$form.laf_status_id?.invalid">
                                <Message v-for="error of $form.laf_status.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>

                        <div v-show="laf_status_select?.id != 10" class="flex flex-col gap-1">
                            <label for="invoice.filter.date_start" class="first-letter:uppercase">{{ t('invoice.attributes.date_start') }}</label>
                            <DatePicker name="date_start" date-format="dd/mm/yy" :show-time="false" :manualInput="false" autocomplete="off" show-icon />
                            <template v-if="$form.date_start?.invalid">
                                <Message v-for="error of $form.date_start.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>
                        <div v-show="laf_status_select?.id != 10" class="flex flex-col gap-1">
                            <label for="invoice.filter.date_end" class="first-letter:uppercase">{{ t('invoice.attributes.date_end') }}</label>
                            <DatePicker name="date_end" date-format="dd/mm/yy" :show-time="false" :manualInput="false" autocomplete="off" show-icon />
                            <template v-if="$form.date_end?.invalid">
                                <Message v-for="error of $form.date_end.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>
                    </div>
                </Fluid>
                <Button type="button" icon="pi pi-filter-slash" outlined @click="$form.reset()" :title="t('invoice.query.filters.clear')" class="mr-3" />
                <Button type="submit" icon="pi pi-search" :title="t('invoice.search')" />
            </Form>
            <AppliedFilters :applied-filters="appliedQueryFilters" />
        </div>
        <div class="card space-y-4">
            <DataTable
                ref="dt"
                :value="invoices"
                v-model:selection="invoicesSelected"
                data-key="id"
                :paginator="true"
                :rows="rows"
                :filters="datatableFilters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="rowsPerPageOptions"
                :currentPageReportTemplate="t('invoice.datatable.currentPageReportTemplate')"
                removableSort
                :loading="loading || error"
                :pt="pt"
                scrollable
                selectionMode="single"
            >
                <template #loading />
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" :title="t('invoice.search')" />
                            </InputIcon>
                            <InputText v-model="datatableFilters['global'].value" :placeholder="t('invoice.datatable.filters.search')" />
                            <InputIcon>
                                <i class="pi pi-times" @click="DataTableFiltersService.clearDatatableFilter('global')" />
                            </InputIcon>
                        </IconField>

                        <div v-if="invoicesSelected.length != 0">
                            <Button icon="pi pi-file-pdf" :title="t('invoice.make_pdf.title')" class="mr-3" @click="makePdfsToInvoicesSelected" />
                            <Button icon="pi pi-envelope" :title="t('invoice.send_email.title')" @click="sendEmailsToInvoicesSelected" />
                        </div>
                        <div class="flex flex-row">
                            <FileUpload
                                v-if="invoices.length == 0"
                                ref="csvUpload"
                                auto
                                :url="uploadUrl"
                                choose-icon="pi pi-file-import"
                                choose-label="CSV"
                                mode="basic"
                                name="file"
                                @select="selectCSV"
                                @before-send="beforeSend"
                                @upload="successCSV"
                                @error="showErrorCSV"
                                class="me-3"
                            />
                            <Button icon="pi pi-file-import" @click="showServicesInvoicePopup" class="me-3" severity="info" :title="t('invoice.template_dialog.title')" />
                            <router-link to="/invoices/new">
                                <Button icon="pi pi-plus" :title="t('invoice.store.title')" />
                            </router-link>
                        </div>
                    </div>
                </template>
                <template #empty>{{ t('invoice.datatable.empty') }}</template>

                <Column selectionMode="multiple" :exportable="false" frozen style="width: 3rem">
                    <template v-if="loading || error" #body>
                        <Skeleton size="1.25rem" borderRadius="4px" />
                    </template>
                </Column>
                <Column field="full_number" :header="t('invoice.attributes.full_number')" sortable style="min-width: 8rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.laf_status_id?.id != 10 ? (slotProps.data?.full_number ?? 'Sin serie') : (slotProps.data?.id ?? 'Sin serie') }}
                    </template>
                </Column>
                <Column field="laf_status_id.id" :header="t('invoice.attributes.laf_status')" sortable style="min-width: 6rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                    <template v-else #body="slotProps">
                        <div v-if="slotProps.data?.laf_status_id?.name">
                            <Tag :severity="colorTag(slotProps)">{{ slotProps.data?.laf_status_id?.name }}</Tag>
                        </div>
                        <div v-else>
                            {{ 'Sin LAF' }}
                        </div>
                    </template>
                </Column>
                <Column field="date" :header="t('invoice.attributes.date')" sortable style="min-width: 8rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.date ? DateService.date.toPayloadFormat(new Date(slotProps.data.date)) : 'Sin fecha' }}
                    </template>
                </Column>
                <Column field="entity_name" :header="t('invoice.attributes.entity_name')" sortable style="min-width: 10rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.entity_name ?? 'Sin nombre de la entidad' }}
                    </template>
                </Column>
                <Column field="entity_crn" :header="t('invoice.attributes.entity_crn')" sortable style="min-width: 12rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.entity_crn ?? 'Sin crn' }}
                    </template>
                </Column>
                <Column field="issuer_name" :header="t('invoice.attributes.issuer')" sortable style="min-width: 12rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.issuer_name ?? 'Sin nombre del emisor' }}
                    </template>
                </Column>
                <Column field="sended_at" :header="t('invoice.attributes.sended')" sortable style="min-width: 8rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.sended_at ? DateService.date.toPayloadFormat(new Date(slotProps.data.sended_at)) : 'Sin enviar' }}
                    </template>
                </Column>
                <Column field="paid_at" :header="t('invoice.attributes.paid')" sortable style="min-width: 8rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.paid_at ? DateService.date.toPayloadFormat(new Date(slotProps.data.paid_at)) : 'Sin pagar' }}
                    </template>
                </Column>

                <Column field="total_price" :header="t('invoice.attributes.total_price')" sortable style="min-width: 8rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ !isNaN(parseFloat(slotProps.data?.total_price)) ? parseFloat(slotProps.data.total_price).toFixed(2) + ' €' : '0 €' }}
                    </template>
                </Column>

                <Column field="total_tax_amount" :header="t('invoice.attributes.total_tax_amount')" sortable style="min-width: 8rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ !isNaN(parseFloat(slotProps.data?.total_tax_amount)) ? parseFloat(slotProps.data.total_tax_amount).toFixed(2) + ' €' : '0 €' }}
                    </template>
                </Column>

                <Column field="total_amount" :header="t('invoice.attributes.total_amount')" sortable style="min-width: 8rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ !isNaN(parseFloat(slotProps.data?.total_amount)) ? parseFloat(slotProps.data.total_amount).toFixed(2) + ' €' : '0 €' }}
                    </template>
                </Column>

                <Column :exportable="false" frozen align-frozen="right" :header="t('invoice.actions')" style="min-width: 4rem">
                    <template #body="slotProps">
                        <div class="flex gap-2 justify-evenly items-center">
                            <Button v-if="loading || error" disabled icon="pi pi-pencil" text />
                            <router-link v-else :to="`/invoices/edit/${slotProps.data.id}`">
                                <Button icon="pi pi-pencil" text :title="t('invoice.update.title')" />
                            </router-link>

                            <Button v-if="loading || error" disabled icon="pi pi-file-pdf" text />
                            <template v-else>
                                <Button icon="pi pi-file-pdf" text :title="t('invoice.make_pdf.title')" @click="makePdf(slotProps.data.id)" />
                            </template>

                            <Button v-if="loading || error" disabled icon="pi pi-envelope" text />
                            <template v-else>
                                <Button v-if="slotProps.data?.laf_status_id?.id != 10" icon="pi pi-envelope" :disabled="slotProps.data?.laf_status_id?.id == 10" text :title="t('invoice.send_email.title')" @click="sendEmail(slotProps.data.id)" />
                            </template>

                            <Button v-if="loading || error" disabled icon="pi pi-trash" severity="danger" text />
                            <template v-else>
                                <ConfirmPopup />
                                <Button v-if="slotProps.data?.laf_status_id?.id == 10" ref="popup" icon="pi pi-trash" severity="danger" text :title="t('invoice.delete.title')" @click="confirmDelete($event, slotProps.data.id)" />
                            </template>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>

    <Dialog v-model:visible="showServiceInvoicesDialog" modal :header="t('invoice.template_dialog.title')" :style="{ width: '35rem' }">
        <div class="space-y-4">
            <div class="flex flex-col gap-2">
                <label class="font-semibold">{{ t('invoice.template_dialog.download_section') }}</label>
                <p class="text-sm text-gray-600">{{ t('invoice.template_dialog.download_description') }}</p>
                <Button icon="pi pi-download" :label="t('invoice.template_dialog.download_button')" severity="secondary" outlined @click="downloadSuppliesTemplate" :loading="downloadingTemplate" />
            </div>

            <Divider />

            <div class="flex flex-col gap-2">
                <label class="font-semibold">{{ t('invoice.template_dialog.upload_section') }}</label>
                <p class="text-sm text-gray-600">{{ t('invoice.template_dialog.upload_description') }}</p>
                <FileUpload
                    ref="templateUpload"
                    choose-icon="pi pi-upload"
                    :choose-label="t('invoice.template_dialog.upload_button')"
                    mode="basic"
                    name="file"
                    accept=".xlsx,.xls"
                    @select="uploadSuppliesTemplate"
                    :max-file-size="5000000"
                    :auto="false"
                    :custom-upload="true"
                />
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button type="button" :label="t('invoice.template_dialog.close')" @click="showServiceInvoicesDialog = false" severity="secondary" outlined />
            </div>
        </template>
    </Dialog>
</template>
