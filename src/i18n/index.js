import { createI18n } from 'vue-i18n';

import en from './en';
import es from './es';

const i18n = createI18n({
    locale: import.meta.env.VITE_DEFAULT_LOCALE,
    fallbackLocale: import.meta.env.VITE_FALLBACK_LOCALE,
    legacy: false,
    globalInjection: true,
    messages: {
        en,
        es
    }
});

export default i18n;
