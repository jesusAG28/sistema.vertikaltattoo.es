import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useLoadingStore = defineStore('loading', () => {
    const loading = ref(false);

    const enable = () => {
        if (loading.value) {
            return;
        }

        loading.value = true;
    };

    const disable = () => {
        if (!loading.value) {
            return;
        }

        loading.value = false;
    };

    const toggle = () => {
        loading.value = !loading.value;
    };

    return { loading, toggle, enable, disable };
});
