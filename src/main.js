import { createApp } from 'vue';
import { createPinia } from 'pinia';
import i18n from './i18n';
import router from './router';
import App from './App.vue';

import BlockViewer from '@/components/BlockViewer.vue';
import { ThemesService } from './service/ThemesService';
import PrimeVue from 'primevue/config';
import esPrimevueLocaleConfig from '@/i18n/es/primevue.json';
import enPrimevueLocaleConfig from '@/i18n/en/primevue.json';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import { useAuthStore } from './stores/auth';
import { useSettingsStore } from './stores/settings';
import { useLoadingStore } from './stores/loading';

import '@/assets/styles.scss';

const app = createApp(App);

app.use(createPinia());

const authStore = useAuthStore();
useSettingsStore();
useLoadingStore();

app.use(i18n);
app.use(router);
app.use(PrimeVue, {
    locale: authStore.user?.preferences?.locale === 'en' ? enPrimevueLocaleConfig : esPrimevueLocaleConfig,
    ripple: true,
    theme: {
        preset: ThemesService.preset,
        options: ThemesService.options
    }
});
app.use(ToastService);
app.use(ConfirmationService);
app.component('BlockViewer', BlockViewer);

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
    onNeedRefresh() {
        // Opcional: mostrar notificación de actualización
    },
    onOfflineReady() {
        // Opcional: mostrar que la app está lista offline
    }
});

app.mount('#app');
