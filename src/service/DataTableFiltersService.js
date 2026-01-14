import { FilterMatchMode } from '@primevue/core/api';
import { ref } from 'vue';

const datatableFilters = ref({});
const filtersLoading = ref(false);

const getDatatableInitialFilters = () => {
    return { global: { value: null, matchMode: FilterMatchMode.CONTAINS } };
};

const fetchFiltersData = async (fetchFilters) => {
    filtersLoading.value = true;
    try {
        // await Promise.all([fetchEntitiesFilterData(),fetchSubscriptionsFilterData()]);
        await Promise.all(fetchFilters);
    } finally {
        filtersLoading.value = false;
    }
};

export const DataTableFiltersService = {
    initDatatableFilters: (fetchFilters) => {
        datatableFilters.value = getDatatableInitialFilters();

        if (fetchFilters && Array.isArray(fetchFilters)) {
            fetchFiltersData(fetchFilters);
        }

        return datatableFilters.value;
    },

    clearDatatableFilter: (filter) => {
        const initialFilters = getDatatableInitialFilters();

        datatableFilters.value[filter].value = initialFilters[filter].value;
    }
};
