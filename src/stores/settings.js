import { defineStore } from 'pinia';
import { ref } from 'vue';
import { SettingsService } from '@/service/SettingsService';
import { useAuthStore } from './auth';

export const useSettingsStore = defineStore('settings', () => {
    const authStore = useAuthStore();

    const initialValues = SettingsService.getSettings();

    const dataTable = ref(initialValues.dataTable);

    if (authStore.user?.preferences?.dataTable?.rows) {
        dataTable.value.rows = authStore.user.preferences.dataTable.rows;
    }

    if (authStore.user?.preferences?.dataTable?.rowsPerPageOptions) {
        dataTable.value.rowsPerPageOptions = authStore.user.preferences.dataTable.rowsPerPageOptions;
    }

    const reset = () => {
        const initialValues = SettingsService.getSettings();

        dataTable.value = initialValues.dataTable;
    };

    return { dataTable, reset };
});
