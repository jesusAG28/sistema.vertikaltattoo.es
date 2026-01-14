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
import { createEntityFromApi } from '@/clases/entity';
import { DataTableFiltersService } from '@/service/DataTableFiltersService';
import { translateQueryFilters } from '@/service/QueryFiltersService';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();

const settingsStore = useSettingsStore();

const loading = ref(false);
const error = ref(false);

const dt = ref(null);
const rows = ref(settingsStore.dataTable.rows);
const rowsPerPageOptions = ref(settingsStore.dataTable.rowsPerPageOptions);
const entities = ref(new Array(rows.value));
const selected = ref(null);
const pt = { mask: { style: { '--p-mask-background': 'transparent' } }, column: { columnTitle: { class: 'p-datatable-column-title first-letter:uppercase' } } };

const fetch = async (queryFilterValues = []) => {
    loading.value = true;

    try {
        const response = await (queryFilterValues.length === 0 ? EntityService.list() : EntityService.search(queryFilterValues));

        if (response.data?.entities) {
            entities.value = response.data.entities.map((entity) => createEntityFromApi(entity));
        }

        if (error.value) {
            error.value = false;
        }
    } catch (AxiosError) {
        error.value = true;
    }

    loading.value = false;
};

const initialQueryFilters = ref(EntityService.getInitialFilterValues());
const appliedQueryFilters = ref(translateQueryFilters(EntityService.getInitialFilterValues(), 'entity.attributes'));

const search = ({ valid, values }) => {
    if (!valid) {
        return;
    }

    appliedQueryFilters.value = translateQueryFilters(values, 'entity.attributes');
    values.active = values?.active?.id ?? null;

    fetch(values);
};

const datatableFilters = ref();

const toast = useToast();
const confirmDeletePopup = useConfirm();

function confirmDelete(event, id) {
    console.log('entitiy id :' + id);
    confirmDeletePopup.require({
        target: event.target,
        message: t('entity.delete.confirm.message'),
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: t('entity.delete.confirm.reject'),
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
                await EntityService.delete(id);

                toast.add({ severity: 'success', summary: t('entity.delete.success', { id }), life: 3000 });
            } catch (AxiosError) {
                toast.add({ severity: 'error', summary: t('entity.delete.error', { id }), life: 3000 });
            }

            loadingStore.loading = false;

            fetch();
        },
        reject: () => {
            return;
        }
    });
}

const csvUpload = ref(null);


const beforeSend = ({ xhr }) => {
    const authStore = useAuthStore();

    if (authStore.user?.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${authStore.user.token}`);
    }
};


const showErrorCSV = ({ xhr }) => {
    console.log("Status :" + xhr.status);
    
    console.log("Response:" + xhr.response);
    toast.add({ severity: 'error', summary: t('entity.import_csv.error'), life: 3000 });  
}

const selectCSV = (event) => {
    const file = event.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
        console.error('Archivo no permitido. Solo se aceptan CSV.');
        toast.add({ severity: 'error', summary: t('entity.import_csv.error_format'), life: 3000 });
        csvUpload.value.clear();
        return;
    }
}

const successCSV = ({xhr}) => {    
    let successObject = null;

    try {
        successObject = JSON.parse(xhr.response);
    }catch(error){
        console.log(error);
    }

    toast.add({ severity: 'success', summary: successObject?.message ?? t('entity.import_csv.success'), life: 3000 }); 
    fetch();  
}

const baseUrl = import.meta.env.VITE_API_URL;
const uploadUrl = computed(() => `${baseUrl}/entities/uploadCSV`);

onBeforeMount(() => {
    fetch();
    datatableFilters.value = DataTableFiltersService.initDatatableFilters();
});
</script>

<template>
    <div class="space-y-4">
        <div class="card space-y-4">
            <Form v-slot="$form" :initial-values="initialQueryFilters" @submit="search" class="space-y-4">
                <Fluid>
                    <div class="grid grid-cols-none sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        <div class="flex flex-col gap-1">
                            <label for="entity.filter.name" class="first-letter:uppercase">{{ t('entity.attributes.name') }}</label>
                            <div class="w-full">
                                <IconField>
                                    <InputText id="entity.filter.name" name="name" type="text" />
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
                            <label for="entity.filter.alias" class="first-letter:uppercase">{{ t('entity.attributes.alias') }}</label>
                            <div class="w-full">
                                <IconField>
                                    <InputText id="entity.filter.alias" name="alias" type="text" />
                                    <InputIcon v-if="$form.alias?.value">
                                        <i class="pi pi-times" @click="$form.alias.value = initialQueryFilters.alias" />
                                    </InputIcon>
                                </IconField>
                            </div>
                            <template v-if="$form.alias?.invalid">
                                <Message v-for="error of $form.alias.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label for="entity.filter.crn" class="first-letter:uppercase">{{ t('entity.attributes.crn') }}</label>
                            <div class="w-full">
                                <IconField>
                                    <InputText id="entity.filter.crn" name="crn" type="text" />
                                    <InputIcon v-if="$form.crn?.value">
                                        <i class="pi pi-times" @click="$form.crn.value = initialQueryFilters.crn" />
                                    </InputIcon>
                                </IconField>
                            </div>
                            <template v-if="$form.crn?.invalid">
                                <Message v-for="error of $form.crn.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label for="entity.filter.phone" class="first-letter:uppercase">{{ t('entity.attributes.phone') }}</label>
                            <div class="w-full">
                                <IconField>
                                    <InputText id="entity.filter.phone" name="phone" type="text" />
                                    <InputIcon v-if="$form.phone?.value">
                                        <i class="pi pi-times" @click="$form.phone.value = initialQueryFilters.phone" />
                                    </InputIcon>
                                </IconField>
                            </div>
                            <template v-if="$form.phone?.invalid">
                                <Message v-for="error of $form.phone.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>

                        <div class="flex flex-col gap-1">
                            <span class="first-letter:uppercase">{{ t('entity.attributes.active') }}</span>
                            <SelectButton name="active" :options="EntityService.options.active" :option-label="(option) => t(option.name)" :allow-empty="false" />
                        </div>
                    </div>
                </Fluid>
                <Button type="button" icon="pi pi-filter-slash" class="mr-3" outlined @click="$form.reset()" :title="t('entity.query.filters.clear')" />
                <Button type="submit" icon="pi pi-search" :title="t('entity.search')" />
            </Form>

            <AppliedFilters :applied-filters="appliedQueryFilters" />
        </div>

        <div class="card space-y-4">
            <DataTable
                ref="dt"
                v-model:selection="selected"
                :value="entities"
                dataKey="id"
                :paginator="true"
                :rows="rows"
                :filters="datatableFilters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="rowsPerPageOptions"
                :currentPageReportTemplate="t('entity.datatable.currentPageReportTemplate')"
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
                                <i class="pi pi-search" :title="t('entity.search')" />
                            </InputIcon>
                            <InputText v-model="datatableFilters['global'].value" :placeholder="t('entity.datatable.filters.search')" />
                            <InputIcon>
                                <i class="pi pi-times" @click="DataTableFiltersService.clearDatatableFilter('global')" />
                            </InputIcon>
                        </IconField>
                        <div class="flex flex-row">
                            <FileUpload
                                v-if="entities.length == 0"
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
                            <router-link to="/entities/new">
                                <Button icon="pi pi-plus" :title="t('entity.store.title')" />
                            </router-link>
                        </div>

                    </div>
                </template>
                <template #empty>{{ t('entity.datatable.empty') }}</template>

                <Column field="name" :header="t('entity.attributes.name')" sortable style="min-width: 16rem">
                    <template v-if="loading || error" #body>
                        <Skeleton style="width: 90%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.name || 'Sin nombre' }}
                    </template>
                </Column>
                <Column field="alias" :header="t('entity.attributes.alias')" sortable style="min-width: 12rem">
                    <template v-if="loading || error" #body>
                        <Skeleton width="75%" />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.alias || 'Sin alias' }}
                    </template>
                </Column>
                <Column field="crn" :header="t('entity.attributes.crn')" sortable style="min-width: 7rem">
                    <template v-if="loading || error" #body>
                        <Skeleton />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.crn || 'Sin NIF' }}
                    </template>
                </Column>
                <Column field="phone" :header="t('entity.attributes.phone')" sortable style="min-width: 7rem">
                    <template v-if="loading || error" #body>
                        <Skeleton />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.phone || 'Sin teléfono' }}
                    </template>
                </Column>
                <Column field="payment_method_id" :header="t('entity.attributes.payment_method')" sortable style="min-width: 7rem">
                    <template v-if="loading || error" #body>
                        <Skeleton />
                    </template>
                    <template v-else #body="slotProps">
                        {{ slotProps.data?.payment_method_id?.name ?? 'Sin metodo de pago' }}
                    </template>
                </Column>
                <Column field="active" :header="t('entity.attributes.active')" data-type="boolean" body-class="text-center" sortable style="min-width: 3rem">
                    <template #body="{ data }">
                        <Skeleton v-if="loading || error" shape="circle" size="1rem" />
                        <i v-else class="pi" :class="{ 'pi-check-circle text-green-500 ': data.active, 'pi-times-circle text-red-500': !data.active }" />
                    </template>
                </Column>
                <Column :exportable="false" :header="t('entity.actions')" frozen align-frozen="right" style="min-width: 8rem">
                    <template #body="slotProps">
                        <div class="flex gap-2">
                            <Button v-if="loading || error" disabled icon="pi pi-pencil" text />
                            <router-link v-else :to="`/entities/edit/${slotProps.data.id}`">
                                <Button icon="pi pi-pencil" text :title="t('entity.update.title')" />
                            </router-link>

                            <Button v-if="loading || error" disabled icon="pi pi-trash" severity="danger" text />
                            <template v-else>
                                <ConfirmPopup />
                                <Button ref="popup" icon="pi pi-trash" severity="danger" text :title="t('entity.delete.title')" @click="confirmDelete($event, slotProps.data.id)" />
                            </template>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>
