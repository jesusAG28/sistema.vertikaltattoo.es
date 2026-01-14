<script setup>
import { onBeforeMount, ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useLoadingStore } from '@/stores/loading';
import { RoleService } from '@/service/RoleService';
import { FilterMatchMode } from '@primevue/core/api';
import { RouterLink } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue';
import { useI18n } from 'vue-i18n';

onBeforeMount(() => {
    fetch();
    initDatatableFilters();
});

const { t } = useI18n();

const settingsStore = useSettingsStore();

const loading = ref(false);
const error = ref(false);

const dt = ref(null);
const rows = ref(settingsStore.dataTable.rows);
const rowsPerPageOptions = ref(settingsStore.dataTable.rowsPerPageOptions);
const roles = ref(new Array(rows.value));
const selected = ref(null);
const pt = { mask: { style: { '--p-mask-background': 'transparent' } }, column: { columnTitle: { class: 'p-datatable-column-title first-letter:uppercase' } } };

const fetch = async () => {
    loading.value = true;

    try {
        const response = await RoleService.list();

        if (response.data?.roles) {
            roles.value = response.data.roles;
        }

        if (error.value) {
            error.value = false;
        }
    } catch (AxiosError) {
        error.value = true;
    }

    loading.value = false;
};

const datatableFilters = ref();

const getDatatableInitialFilters = () => {
    return { global: { value: null, matchMode: FilterMatchMode.CONTAINS } };
};

const initDatatableFilters = () => {
    datatableFilters.value = getDatatableInitialFilters();
};

const clearDatatableFilter = (filter) => {
    const initialFilters = getDatatableInitialFilters();

    datatableFilters.value[filter].value = initialFilters[filter].value;
};

const toast = useToast();
const confirmDeletePopup = useConfirm();

function confirmDelete(event, id) {
    confirmDeletePopup.require({
        target: event.target,
        message: t('role.delete.confirm.message'),
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: t('role.delete.confirm.reject'),
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
                await RoleService.delete(id);

                toast.add({ severity: 'success', summary: t('role.delete.success', { id }), life: 3000 });
            } catch (AxiosError) {
                toast.add({ severity: 'error', summary: t('role.delete.error', { id }), life: 3000 });
            }

            loadingStore.loading = false;

            fetch();
        },
        reject: () => {
            return;
        }
    });
}
</script>

<template>
    <div class="space-y-4">
        <div class="card space-y-4">
            <DataTable
                ref="dt"
                v-model:selection="selected"
                :value="roles"
                dataKey="id"
                :paginator="true"
                :rows="rows"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReportTemplate RowsPerPageDropdown"
                :rowsPerPageOptions="rowsPerPageOptions"
                :currentPageReportTemplate="t('role.datatable.currentPageReportTemplate')"
                removableSort
                :loading="loading || error"
                :pt="pt"
                scrollable
            >
                <template #loading />
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" :title="t('role.search')" />
                            </InputIcon>
                            <InputText v-model="datatableFilters['global'].value" :placeholder="t('role.datatable.filters.search')" />
                            <InputIcon>
                                <i class="pi pi-times" @click="clearDatatableFilter('global')" />
                            </InputIcon>
                        </IconField>
                    </div>
                </template>
                <template #empty>{{ t('role.datatable.empty') }}</template>

                <Column selectionMode="multiple" :exportable="false" frozen style="width: 3rem">
                    <template v-if="loading || error" #body>
                        <Skeleton size="1.25rem" borderRadius="4px" />
                    </template>
                </Column>

                <Column field="name" :header="t('role.attributes.name')" sortable style="min-width: 16rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                </Column>

                <Column field="guard_name" :header="t('role.attributes.guard_name')" sortable style="min-width: 16rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                </Column>

                <Column field="created_at" :header="t('role.attributes.created_at')" sortable style="min-width: 10rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                </Column>

                <Column field="updated_at" :header="t('role.attributes.updated_at')" sortable style="min-width: 10rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                </Column>

                <Column :exportable="false" frozen align-frozen="right" style="min-width: 8rem">
                    <template #body="slotProps">
                        <div class="flex gap-2">
                            <Button v-if="loading || error" disabled icon="pi pi-pencil" text />
                            <router-link v-else :to="`/roles/edit/${slotProps.data?.id}`">
                                <Button icon="pi pi-pencil" text :title="t('role.update.title')" />
                            </router-link>
                            <Button v-if="loading || error" disabled icon="pi pi-trash" severity="danger" text />
                            <template v-else>
                                <ConfirmPopup />
                                <Button ref="popup" icon="pi pi-trash" severity="danger" text :title="t('role.delete.title')" @click="confirmDelete($event, slotProps.data?.id)" />
                            </template>
                        </div>
                    </template>
                </Column>
            </DataTable>

            <div class="">
                <router-link to="/roles/new">
                    <Button icon="pi pi-plus" :title="t('role.store.title')" />
                </router-link>
            </div>
        </div>
    </div>
</template>
