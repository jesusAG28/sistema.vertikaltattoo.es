<script setup>
import { onBeforeMount, ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useLoadingStore } from '@/stores/loading';
import { SubscriptionService } from '@/service/SubscriptionService';
import { Form } from '@primevue/forms';
import AppliedFilters from '@/components/ui/AppliedFilters.vue';
import { RouterLink } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue';
import { useI18n } from 'vue-i18n';
import { BillingCyclesService } from '@/service/BillingCyclesService';
import { createSubscriptionFromApi } from '@/clases/subscription';
import { useSelectData } from '@/composables/useSelectData';
import { DataTableFiltersService } from '@/service/DataTableFiltersService';
import { translateQueryFilters } from '@/service/QueryFiltersService';
import { ServiceTypesService } from '@/service/ServiceTypesSercvice';

const toast = useToast();

const { t } = useI18n();

const settingsStore = useSettingsStore();

const loading = ref(false);
const error = ref(false);

const dt = ref(null);
const rows = ref(settingsStore.dataTable.rows);
const rowsPerPageOptions = ref(settingsStore.dataTable.rowsPerPageOptions);
const subscriptions = ref(new Array(rows.value));
const selected = ref(null);
const pt = { mask: { style: { '--p-mask-background': 'transparent' } }, column: { columnTitle: { class: 'p-datatable-column-title first-letter:uppercase' } } };

const fetch = async (queryFilterValues = []) => {
    loading.value = true;

    try {
        const response = await (queryFilterValues.length == 0 ? SubscriptionService.list() : SubscriptionService.search(queryFilterValues));

        if (response.data?.subscriptions) {
            subscriptions.value = response.data.subscriptions.map((sub) => createSubscriptionFromApi(sub));
        }

        if (error.value) {
            error.value = false;
        }
    } catch (AxiosError) {
        error.value = true;
    }

    loading.value = false;
};

const { items: service_types, loading: loadingServiceTypes, fetchData: fetchServiceTypes} = useSelectData(
    ServiceTypesService.list, 
    {
        toast, 
        i18n: { t },
        errorMsgKey: 'subscription.service_types.error',
        dataValue: 'service_types'
    }
);

const { items: billing_cycles, loading: loadingBillingCycles, fetchData: fetchBillingCycles} = useSelectData(
    BillingCyclesService.list, 
    {
        toast, 
        i18n: { t },
        errorMsgKey: 'subscription.billing_cycles.error',
        dataValue: 'billing_cycles'
    }
);

const initialQueryFilters = ref(SubscriptionService.getInitialFilterValues());
const appliedQueryFilters = ref(translateQueryFilters(SubscriptionService.getInitialFilterValues(), 'subscription.attributes'));

const search = ({ valid, values }) => {
    if (!valid) {
        return;
    }

    appliedQueryFilters.value = translateQueryFilters(values, 'subscription.attributes');

    values.billing_cycle_id = values?.billing_cycle_id?.id ?? null;
    values.active = values?.active?.id ?? null;

    fetch(values);
};

const datatableFilters = ref();

const confirmDeletePopup = useConfirm();

//Retocar nombres de la traduccion y mensajes
function confirmDelete(event, id) {
    confirmDeletePopup.require({
        target: event.target,
        message: t('subscription.delete.confirm.message'),
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: t('subscription.delete.confirm.reject'),
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            icon: 'pi pi-trash',
            severity: 'danger'
        },
        accept: async () => {
            const loadingStore = useLoadingStore();

            loadingStore.toggle();

            try {
                await SubscriptionService.delete(id);

                toast.add({ severity: 'success', summary: t('subscription.delete.success', { id }), life: 3000 });
            } catch (AxiosError) {
                toast.add({ severity: 'error', summary: t('subscription.delete.error', { id }), life: 3000 });
            }

            loadingStore.toggle();

            fetch();
        },
        reject: () => {
            return;
        }
    });
}

onBeforeMount(() => {
    fetch();
    datatableFilters.value = DataTableFiltersService.initDatatableFilters([fetchServiceTypes(), fetchBillingCycles()]);
});
</script>

<template>
    <div class="space-y-4">
        <div class="card space-y-4">
            <Form v-slot="$form" :initial-values="initialQueryFilters" @submit="search" class="space-y-4">
                <Fluid>
                    <div class="grid grid-cols-none sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        <div class="flex flex-col gap-1">
                            <label for="subscription.filter.name" class="first-letter:uppercase">{{ t('subscription.attributes.name') }}</label>
                            <div class="w-full">
                                <IconField>
                                    <InputText id="subscription.filter.name" name="name" type="text" />
                                    <InputIcon v-if="$form.name?.value">
                                        <i class="pi pi-times" @click="$form.name.value = initialQueryFilters.name" />
                                    </InputIcon>
                                </IconField>
                            </div>
                            <template v-if="$form.name?.invalid">
                                <Message v-for="error of $form.name.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label for="subscription.filter.service_type" class="first-letter:uppercase">{{ t('subscription.attributes.service_type') }}</label>
                            <MultiSelect
                                input-id="subscription.filter.service_type"
                                name="service_type_id"
                                :options="service_types"
                                option-label="name"
                                display="chip"
                                :maxSelectedLabels="3"
                                :placeholder="loadingServiceTypes ? t('subscription.service_types.placeholder.loading') : t('subscription.service_types.placeholder.multiple')"
                                :filter="true"
                                :loading="loadingServiceTypes"
                                showClear
                            />
                            <template v-if="$form.service_type_id?.invalid">
                                <Message v-for="error of $form.service_type_id.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label for="subscription.filter.billing_cycle" class="first-letter:uppercase">{{ t('subscription.attributes.billing_cycle') }}</label>
                            <Select
                                input-id="subscription.filter.billing_cycle"
                                name="billing_cycle_id"
                                :options="billing_cycles"
                                option-label="name"
                                :placeholder="loadingBillingCycles ? t('subscription.billing_cycles.placeholder.loading') : t('subscription.billing_cycles.placeholder.single')"
                                :loading="loadingBillingCycles"
                                showClear
                            />
                            <template v-if="$form.billing_cycle_id?.invalid">
                                <Message v-for="error of $form.billing_cycle_id.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label for="subscription.filter.price" class="first-letter:uppercase">{{ t('subscription.attributes.price') }}</label>
                            <div class="w-full">
                                <InputGroup>
                                    <IconField>
                                        <InputNumber id="subscription.filter.price" name="price" :min-fraction-digits="0" :max-fraction-digits="2" :min="0" autocomplete="off" />
                                        <InputIcon v-if="$form.price?.value">
                                            <i class="pi pi-times" @click="$form.price.value = initialQueryFilters.price" />
                                        </InputIcon>
                                    </IconField>
                                    <InputGroupAddon>€</InputGroupAddon>
                                </InputGroup>
                            </div>
                            <template v-if="$form.price?.invalid">
                                <Message v-for="error of $form.price.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>
                        <div class="flex flex-col gap-1">
                            <span class="first-letter:uppercase">{{ t('entity.attributes.active') }}</span>
                            <SelectButton name="active" :options="SubscriptionService.options.active" :option-label="(option) => t(option.name)" :allow-empty="false" />
                        </div>
                    </div>
                </Fluid>

                <Button type="button" icon="pi pi-filter-slash" outlined @click="$form.reset()" :title="t('subscription.query.filters.clear')" class="mr-3" />

                <Button type="submit" icon="pi pi-search" :title="t('entity.search')" />
            </Form>

            <AppliedFilters :applied-filters="appliedQueryFilters" />
        </div>

        <div class="card space-y-4">
            <DataTable
                ref="dt"
                v-model:selection="selected"
                :value="subscriptions"
                dataKey="id"
                :paginator="true"
                :rows="rows"
                :filters="datatableFilters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="rowsPerPageOptions"
                :currentPageReportTemplate="t('subscription.datatable.currentPageReportTemplate')"
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
                                <i class="pi pi-search" :title="t('subscription.search')" />
                            </InputIcon>
                            <InputText v-model="datatableFilters['global'].value" :placeholder="t('subscription.datatable.filters.search')" />
                            <InputIcon>
                                <i class="pi pi-times" @click="DataTableFiltersService.clearDatatableFilter('global')" />
                            </InputIcon>
                        </IconField>
                        <router-link to="/subscriptions/new">
                            <Button icon="pi pi-plus" :title="t('subscription.store.title')" />
                        </router-link>
                    </div>
                </template>
                <template #empty>{{ t('subscription.datatable.empty') }}</template>

                <Column field="name" :header="t('subscription.attributes.name')" sortable style="min-width: 16rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.name || 'Sin nombre' }}
                    </template>
                </Column>
                <Column field="price" :header="t('subscription.attributes.price')" sortable style="min-width: 7rem">
                    <template v-if="loading || error" #body>
                        <Skeleton width="75%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.price + ' €' || 'Sin precio' }}
                    </template>
                </Column>
                <Column field="service_type_id" :header="t('subscription.attributes.service_type_id')" sortable style="min-width: 12rem">
                    <template v-if="loading || error" #body>
                        <Skeleton width="75%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.service_type_id?.name ?? 'Sin tipo de servicio' }}
                    </template>
                </Column>
                <Column field="billing_cycle_id" :header="t('subscription.attributes.billing_cycle')" sortable style="min-width: 10rem">
                    <template v-if="loading || error" #body>
                        <Skeleton />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.billing_cycle_id?.name || 'Sin ciclo de facturación' }}
                    </template>
                </Column>
                <Column field="active" :header="t('subscription.attributes.active')" data-type="boolean" body-class="text-center" sortable style="min-width: 3rem">
                    <template #body="{ data }">
                        <Skeleton v-if="loading || error" shape="circle" size="1rem" />
                        <i v-else class="pi" :class="{ 'pi-check-circle text-green-500 ': data.active, 'pi-times-circle text-red-500': !data.active }" />
                    </template>
                </Column>
                <Column :exportable="false" :header="t('subscription.actions')" frozen align-frozen="right" style="min-width: 8rem">
                    <template #body="slotProps">
                        <div class="flex gap-2">
                            <Button v-if="loading || error" disabled icon="pi pi-pencil" text />
                            <router-link v-else :to="`/subscriptions/edit/${slotProps.data.id}`">
                                <Button icon="pi pi-pencil" text :title="t('subscription.update.title')" />
                            </router-link>

                            <Button v-if="loading || error" disabled icon="pi pi-trash" severity="danger" text />
                            <template v-else>
                                <ConfirmPopup />
                                <Button ref="popup" icon="pi pi-trash" severity="danger" text :title="t('subscription.delete.title')" @click="confirmDelete($event, slotProps.data.id)" />
                            </template>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>
