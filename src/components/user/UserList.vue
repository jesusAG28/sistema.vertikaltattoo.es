<script setup>
import { onBeforeMount, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { useLoadingStore } from '@/stores/loading';
import { UserService } from '@/service/UserService';
import { Form } from '@primevue/forms';
import PreloadImageSkeleton from '@/components/ui/PreloadImageSkeleton.vue';
import AppliedFilters from '@/components/ui/AppliedFilters.vue';
import { RouterLink } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue';
import { useI18n } from 'vue-i18n';
import { translateQueryFilters } from '@/service/QueryFiltersService';
import { createUserFromApi } from '@/clases/user';
import { DataTableFiltersService } from '@/service/DataTableFiltersService';

const { t } = useI18n();

const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const loading = ref(false);
const error = ref(false);

const dt = ref(null);
const rows = ref(settingsStore.dataTable.rows);
const rowsPerPageOptions = ref(settingsStore.dataTable.rowsPerPageOptions);
const users = ref(new Array(rows.value));
const pt = { mask: { style: { '--p-mask-background': 'transparent' } }, column: { columnTitle: { class: 'p-datatable-column-title first-letter:uppercase' } } };

const fetch = async (queryFilterValues = []) => {
    loading.value = true;

    try {
        const response = await UserService.search(queryFilterValues);

        if (response.data?.users && Array.isArray(response.data.users)) {
            users.value = response.data.users.map((user) => createUserFromApi(user));
        }

        if (error.value) {
            error.value = false;
        }
    } catch (AxiosError) {
        error.value = true;
    }

    loading.value = false;
};

// const filtersLoading = ref(false);
// const fetchFiltersData = async () => {
//     filtersLoading.value = true;

//     try {
//         await Promise.all([fetchRolesFilterData()]);
//     } finally {
//         filtersLoading.value = false;
//     }
// };

// const filterRoleMultiselectValues = ref([]);
// const filterRolesLoading = ref(false);
// const fetchRolesFilterData = async () => {
//     filterRolesLoading.value = true;

//     try {
//         const response = await RoleService.list();

//         if (response.data?.roles) {
//             filterRoleMultiselectValues.value = response.data.roles;
//         }
//     } catch {
//         // empty catch
//     }

//     filterRolesLoading.value = false;
// };

const initialQueryFilters = ref(UserService.getInitialFilterValues());
const appliedQueryFilters = ref(translateQueryFilters(UserService.getInitialFilterValues(), 'user.attributes'));

const search = ({ valid, values }) => {
    if (!valid) {
        return;
    }

    appliedQueryFilters.value = translateQueryFilters(values, 'user.attributes');
    values.active = values?.active?.id ?? null;

    fetch(values);
};

const datatableFilters = ref();

const imageSrc = (data) => {
    return data?.image ? `${authStore.assetsBaseUrl}${data.image}` : null;
};

const imageDesc = (data) => {
    return data?.image ? `${data.name} image` : null;
};

const toast = useToast();
const confirmDeletePopup = useConfirm();

function confirmDelete(event, id) {
    confirmDeletePopup.require({
        target: event.target,
        message: t('user.delete.confirm.message'),
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: t('user.delete.confirm.reject'),
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
                await UserService.delete(id);

                toast.add({ severity: 'success', summary: t('user.delete.success', { id }), life: 3000 });
            } catch (AxiosError) {
                toast.add({ severity: 'error', summary: t('user.delete.error', { id }), life: 3000 });
            }

            loadingStore.loading = false;

            fetch();
        },
        reject: () => {
            return;
        }
    });
}

onBeforeMount(() => {
    let search_init = { ...initialQueryFilters.value };
    search_init.active = search_init?.active?.id ?? null;
    fetch(search_init);
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
                            <label for="user.filter.name" class="first-letter:uppercase">{{ t('user.attributes.name') }}</label>
                            <div class="w-full">
                                <IconField>
                                    <InputText id="user.filter.name" name="name" type="text" />
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
                            <label for="user.filter.email" class="first-letter:uppercase">{{ t('user.attributes.email') }}</label>
                            <div class="w-full">
                                <IconField>
                                    <InputText id="user.filter.email" name="email" type="text" />
                                    <InputIcon v-if="$form.email?.value">
                                        <i class="pi pi-times" @click="$form.email.value = initialQueryFilters.email" />
                                    </InputIcon>
                                </IconField>
                            </div>
                            <template v-if="$form.email?.invalid">
                                <Message v-for="error of $form.email.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div>
                        <!-- <div class="flex flex-col gap-1">
                            <label for="user.filter.roles" class="first-letter:uppercase">{{ t('user.attributes.roles') }}</label>
                            <MultiSelect
                                input-id="user.filter.roles"
                                name="roles"
                                :options="filterRoleMultiselectValues"
                                option-label="name"
                                display="chip"
                                :placeholder="filterRolesLoading ? t('user.roles.placeholder.loading') : t('user.roles.placeholder.multiple')"
                                :filter="true"
                                :loading="filterRolesLoading"
                            />
                            <template v-if="$form.roles?.invalid">
                                <Message v-for="error of $form.roles.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                            </template>
                        </div> -->
                        <div class="flex flex-col gap-1">
                            <span class="first-letter:uppercase">{{ t('user.attributes.active') }}</span>
                            <SelectButton name="active" :options="UserService.options.active" :option-label="(option) => t(option.name)" :allow-empty="false" />
                        </div>
                    </div>
                </Fluid>
                <Button type="button" icon="pi pi-filter-slash" outlined @click="$form.reset()" :title="t('user.query.filters.clear')" class="mr-3" />
                <Button type="submit" icon="pi pi-search" :title="t('user.search')" />
            </Form>

            <AppliedFilters :applied-filters="appliedQueryFilters" />
        </div>

        <div class="card space-y-4">
            <DataTable
                ref="dt"
                :value="users"
                dataKey="id"
                :paginator="true"
                :rows="rows"
                :filters="datatableFilters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="rowsPerPageOptions"
                :currentPageReportTemplate="t('user.datatable.currentPageReportTemplate')"
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
                                <i class="pi pi-search" :title="t('user.search')" />
                            </InputIcon>
                            <InputText v-model="datatableFilters['global'].value" :placeholder="t('user.datatable.filters.search')" />
                            <InputIcon>
                                <i class="pi pi-times" @click="DataTableFiltersService.clearDatatableFilter('global')" />
                            </InputIcon>
                        </IconField>
                        <router-link to="/users/new">
                            <Button icon="pi pi-plus" :title="t('user.store.title')" />
                        </router-link>
                    </div>
                </template>
                <template #empty>{{ t('user.datatable.empty') }}</template>

                <Column :header="t('user.attributes.image')" style="width: 64px">
                    <template #body="slotProps">
                        <Skeleton v-if="loading || error" style="width: 64px; height: 26px" />
                        <PreloadImageSkeleton v-else :src="imageSrc(slotProps.data)" :alt="imageDesc(slotProps.data)" :title="imageDesc(slotProps.data)" skeleton-style="width: 64px; height: 26px" image-style="width: 64px" />
                    </template>
                </Column>
                <Column field="name" :header="t('user.attributes.name')" sortable style="min-width: 14rem">
                    <template #body="slotProps">
                        <Skeleton v-if="loading || error" style="width: 90%" />
                        <template v-else>{{ slotProps.data?.name ?? 'Sin nombre' }}</template>
                    </template>
                </Column>
                <Column field="email" :header="t('user.attributes.email')" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        <Skeleton v-if="loading || error" style="width: 90%" />
                        <template v-else>{{ slotProps.data?.email ?? 'Sin nombre' }}</template>
                    </template>
                </Column>
                <!-- <Column field="roles.name" header="Role" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        <Skeleton v-if="loading || error" style="width: 75%" />
                        <Tag v-else :value="slotProps.data.roles?.name" severity="info" class="whitespace-nowrap" />
                    </template>
                </Column> -->
                <Column field="active" :header="t('user.attributes.active')" data-type="boolean" body-class="text-center" sortable style="min-width: 3rem">
                    <template #body="{ data }">
                        <Skeleton v-if="loading || error" shape="circle" size="1rem" />
                        <i v-else class="pi" :class="{ 'pi-check-circle text-green-500 ': data.active, 'pi-times-circle text-red-500': !data.active }" />
                    </template>
                </Column>
                <Column field="created_at" :header="t('user.attributes.created_at')" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        <Skeleton v-if="loading || error" style="width: 90%" />
                        <template v-else>{{ slotProps.data?.created_at ?? 'Sin fecha de creacion' }}</template>
                    </template>
                </Column>
                <Column field="updated_at" :header="t('user.attributes.updated_at')" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        <Skeleton v-if="loading || error" style="width: 90%" />
                        <template v-else>{{ slotProps.data?.updated_at ?? 'Sin fecha de actualizacion' }}</template>
                    </template>
                </Column>
                <Column :header="t('user.actions')" :exportable="false" frozen align-frozen="right" style="min-width: 8rem">
                    <template #body="slotProps">
                        <div class="flex gap-2">
                            <Button v-if="loading || error" disabled icon="pi pi-pencil" text />
                            <router-link v-else :to="`/users/edit/${slotProps.data.id}`">
                                <Button icon="pi pi-pencil" text :title="t('user.update.title')" />
                            </router-link>
                            <Button v-if="loading || error" disabled icon="pi pi-trash" severity="danger" text />
                            <template v-else>
                                <ConfirmPopup />
                                <Button ref="popup" icon="pi pi-trash" severity="danger" text :title="t('user.delete.title')" @click="confirmDelete($event, slotProps.data.id)" />
                            </template>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>
