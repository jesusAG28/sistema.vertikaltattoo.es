<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useLoadingStore } from '@/stores/loading';
import { EntityService } from '@/service/EntityService';
import { Form } from '@primevue/forms';
import AppliedFilters from '@/components/ui/AppliedFilters.vue';
import { RouterLink } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue';
import { useI18n } from 'vue-i18n';
import { EntitySubscriptionService } from '@/service/EntitySubscriptionService';
import { SubscriptionService } from '@/service/SubscriptionService';
import { DateService } from '@/service/DateService';
import { createEntitySubscriptionFromApi } from '@/clases/entitySubscription';
import { createEntityFromApi } from '@/clases/entity';
import { createSubscriptionFromApi } from '@/clases/subscription';
import { DataTableFiltersService } from '@/service/DataTableFiltersService';
import { translateQueryFilters } from '@/service/QueryFiltersService';
import { useAuthStore } from '@/stores/auth';

const toast = useToast();

const { t } = useI18n();

const settingsStore = useSettingsStore();

const loading = ref(false);
const error = ref(false);

const dt = ref(null);
const rows = ref(settingsStore.dataTable.rows);
const rowsPerPageOptions = ref(settingsStore.dataTable.rowsPerPageOptions);
const entities_subscriptions = ref(new Array(rows.value));
const selected = ref(null);
const pt = { mask: { style: { '--p-mask-background': 'transparent' } }, column: { columnTitle: { class: 'p-datatable-column-title first-letter:uppercase' } } };

const fetch = async (queryFilterValues = []) => {
    loading.value = true;

    try {
        const response = queryFilterValues.length === 0 ? await EntitySubscriptionService.list() : await EntitySubscriptionService.search(queryFilterValues);

        if (response.data?.entities_subscriptions) {
            entities_subscriptions.value = response.data.entities_subscriptions.map((enty_sub) => createEntitySubscriptionFromApi(enty_sub));
        }

        if (error.value) {
            error.value = false;
        }
    } catch (AxiosError) {
        error.value = true;
    }

    loading.value = false;
};

const entities = ref([]);
const filterEntitiesLoading = ref(false);
const fetchEntitiesFilterData = async () => {
    filterEntitiesLoading.value = true;

    try {
        const response = await EntityService.search({ in_entity_subscription: true });

        if (response.data?.entities) {
            entities.value = response.data.entities.map((entity) => createEntityFromApi(entity));
        }
    } catch (AxiosError) {
        toast.add({
            severity: 'error',
            summary: t('entity_subscription.entities.error'),
            detail: AxiosError.response?.data?.message,
            life: 3000
        });
    }

    filterEntitiesLoading.value = false;
};
const subscriptions = ref([]);
const filterSubscriptionsLoading = ref(false);
const fetchSubscriptionsFilterData = async () => {
    filterSubscriptionsLoading.value = true;

    try {
        const response = await SubscriptionService.search({ in_entity_subscription: true });

        if (response.data?.subscriptions) {
            subscriptions.value = response.data.subscriptions.map((subscription) => createSubscriptionFromApi(subscription));
        }
    } catch (AxiosError) {
        toast.add({
            severity: 'error',
            summary: t('entity_subscription.subscriptions.error'),
            detail: AxiosError.response?.data?.message,
            life: 3000
        });
    }

    filterSubscriptionsLoading.value = false;
};

const initialQueryFilters = ref(EntitySubscriptionService.getInitialFilterValues());
const appliedQueryFilters = ref({});

const getAppliedQueryFilters = () => {
    let filters = EntitySubscriptionService.getInitialFilterValues();

    if (filters.month_active) {
        filters.month_active = t(DateService.getMonth(filters.month_active - 1)?.label) ?? 'Sin mes';
    }

    return translateQueryFilters(filters, 'entity_subscription.attributes');
};

const search = ({ valid, values }) => {
    if (!valid) {
        return;
    }

    let valuesFilter = { ...values };

    if (values.month_active) {
        valuesFilter.month_active = t(DateService.getMonth(values.month_active - 1)?.label) ?? 'Sin mes';
    }

    if (values.year_active) {
        let date = new Date(values.year_active);
        valuesFilter.year_active = date.getFullYear();
        values.year_active = date.getFullYear();
    }

    appliedQueryFilters.value = translateQueryFilters(valuesFilter, 'entity_subscription.attributes');

    fetch(values);
};

const confirmDeletePopup = useConfirm();

function confirmDelete(event, id) {
    confirmDeletePopup.require({
        target: event.target,
        message: t('entity_subscription.delete.confirm.message'),
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: t('entity_subscription.delete.confirm.reject'),
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
                await EntitySubscriptionService.delete(id);

                toast.add({ severity: 'success', summary: t('entity_subscription.delete.success', { id }), life: 3000 });
            } catch (AxiosError) {
                toast.add({ severity: 'error', summary: t('entity_subscription.delete.error', { id }), life: 3000 });
            }

            loadingStore.loading = false;

            fetch();
        },
        reject: () => {
            return;
        }
    });
}

const baseUrl = import.meta.env.VITE_API_URL;
const uploadUrl = computed(() => `${baseUrl}/entity_subscriptions/uploadCSV`);
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
    toast.add({ severity: 'error', summary: t('entity.import_csv.error'), life: 3000 });
};

const selectCSV = (event) => {
    const file = event.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
        console.error('Archivo no permitido. Solo se aceptan CSV.');
        toast.add({ severity: 'error', summary: t('entity.import_csv.error_format'), life: 3000 });
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

    toast.add({ severity: 'success', summary: successObject?.message ?? t('entity.import_csv.success'), life: 3000 });
    fetch();
};

const datatableFilters = ref();

onBeforeMount(() => {
    fetch(initialQueryFilters.value);

    if (initialQueryFilters.value?.year_active) {
        let date = new Date();
        date.setFullYear(initialQueryFilters.value.year_active);
        initialQueryFilters.value.year_active = date;
    }

    appliedQueryFilters.value = getAppliedQueryFilters();
    datatableFilters.value = DataTableFiltersService.initDatatableFilters([fetchEntitiesFilterData(), fetchSubscriptionsFilterData()]);
});
</script>

<template>
    <div class="space-y-4">
        <div class="card space-y-4">
            <Form v-slot="$form" :initial-values="initialQueryFilters" @submit="search" class="space-y-4">
                <Fluid>
                    <div class="grid grid-cols-none sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        <div class="flex flex-col gap-1">
                            <label for="entity_subscription.filter.entities" class="first-letter:uppercase">{{ t('entity_subscription.attributes.entity') }}</label>
                            <MultiSelect
                                name="entity_id"
                                :options="entities"
                                option-label="name"
                                display="chip"
                                :placeholder="filterEntitiesLoading ? t('entity_subscription.entities.placeholder.loading') : t('entity_subscription.entities.placeholder.multiple')"
                                :filter="true"
                                :loading="filterEntitiesLoading"
                            />
                            <template v-if="$form.entity?.invalid">
                                <Message v-for="error of $form.entity.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label for="entity_subscription.filter.subscriptions" class="first-letter:uppercase">{{ t('entity_subscription.attributes.subscription') }}</label>
                            <MultiSelect
                                name="subscription_id"
                                :options="subscriptions"
                                option-label="name"
                                display="chip"
                                :placeholder="filterSubscriptionsLoading ? t('entity_subscription.subscriptions.placeholder.loading') : t('entity_subscription.subscriptions.placeholder.multiple')"
                                :filter="true"
                                :loading="filterSubscriptionsLoading"
                            />
                            <template v-if="$form.subscription?.invalid">
                                <Message v-for="error of $form.subscription.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>
                        <!-- Select List Month -->
                        <div class="flex flex-col gap-1">
                            <label for="entity_subscription.filter.month_active" class="first-letter:uppercase">{{ t('entity_subscription.attributes.month_active') }}</label>
                            <Select
                                name="month_active"
                                :option-label="(option) => t(option.label)"
                                :option-value="(option) => option?.value + 1 ?? option.value"
                                :options="DateService.months"
                                :placeholder="t('entity_subscription.months.placeholder.single')"
                                showClear
                            />
                            <template v-if="$form.month_active?.invalid">
                                <Message v-for="error of $form.month_active.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label for="entity_subscription.filter.year_active" class="first-letter:uppercase">{{ t('entity_subscription.attributes.year_active') }}</label>
                            <DatePicker view="year" date-format="yy" :show-time="false" id="entity_subscription.filter.year_active" name="year_active" :manualInput="false" autocomplete="off" show-icon />
                            <template v-if="$form.year_active?.invalid">
                                <Message v-for="error of $form.year_active.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>
                    </div>
                </Fluid>
                <Button type="button" icon="pi pi-filter-slash" outlined @click="$form.reset()" :title="t('entity_subscription.query.filters.clear')" class="mr-3" />
                <Button type="submit" icon="pi pi-search" :title="t('entity_subscription.search')" />
            </Form>

            <AppliedFilters :applied-filters="appliedQueryFilters" />
        </div>

        <div class="card space-y-4">
            <DataTable
                ref="dt"
                v-model:selection="selected"
                :value="entities_subscriptions"
                dataKey="id"
                :paginator="true"
                :rows="rows"
                :filters="datatableFilters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="rowsPerPageOptions"
                :currentPageReportTemplate="t('entity_subscription.datatable.currentPageReportTemplate')"
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
                                <i class="pi pi-search" :title="t('entity_subscription.search')" />
                            </InputIcon>
                            <InputText v-model="datatableFilters['global'].value" :placeholder="t('entity_subscription.datatable.filters.search')" />
                            <InputIcon>
                                <i class="pi pi-times" @click="DataTableFiltersService.clearDatatableFilter('global')" />
                            </InputIcon>
                        </IconField>
                        <div class="flex flex-row">
                            <FileUpload
                                v-if="entities_subscriptions.length == 0"
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
                            <router-link to="/entities_subscriptions/new">
                                <Button icon="pi pi-plus" :title="t('entity_subscription.store.title')" />
                            </router-link>
                        </div>
                    </div>
                </template>
                <template #empty>{{ t('entity_subscription.datatable.empty') }}</template>

                <Column field="entity_id" :header="t('entity_subscription.attributes.entity')" sortable style="min-width: 16rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.entity_id?.name ?? slotProps.data?.entity?.alias ?? 'Sin nombre de entidad' }}
                    </template>
                </Column>
                <Column field="subscription_id" :header="t('entity_subscription.attributes.subscription')" sortable style="min-width: 10rem">
                    <template v-if="loading || error" #body>
                        <Skeleton width="75%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.subscription_id?.name ?? 'Sin nombre de suscripción' }}
                    </template>
                </Column>
                <Column field="starts_at" :header="t('entity_subscription.attributes.starts_at')" sortable style="min-width: 6rem">
                    <template v-if="loading || error" #body>
                        <Skeleton />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.starts_at ? DateService.date.toPayloadFormat(new Date(slotProps.data.starts_at)) : 'Sin fecha especificada' }}
                    </template>
                </Column>
                <Column field="ends_at" :header="t('entity_subscription.attributes.ends_at')" sortable style="min-width: 7rem">
                    <template v-if="loading || error" #body>
                        <Skeleton />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.ends_at ? DateService.date.toPayloadFormat(new Date(slotProps.data.ends_at)) : 'Sin fecha especificada' }}
                    </template>
                </Column>
                <Column :exportable="false" :header="t('entity_subscription.actions')" frozen align-frozen="right" style="min-width: 8rem">
                    <template #body="slotProps">
                        <div class="flex gap-2">
                            <Button v-if="loading || error" disabled icon="pi pi-pencil" text />
                            <router-link v-else :to="`/entities_subscriptions/edit/${slotProps.data.id}`">
                                <Button icon="pi pi-pencil" text :title="t('entity_subscription.update.title')" />
                            </router-link>

                            <Button v-if="loading || error" disabled icon="pi pi-trash" severity="danger" text />
                            <template v-else>
                                <ConfirmPopup />
                                <Button ref="popup" icon="pi pi-trash" severity="danger" text :title="t('entity_subscription.delete.title')" @click="confirmDelete($event, slotProps.data.id)" />
                            </template>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>
