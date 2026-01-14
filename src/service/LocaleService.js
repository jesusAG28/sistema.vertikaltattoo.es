import enPrimevueLocaleConfig from '@/i18n/en/primevue.json';
import esPrimevueLocaleConfig from '@/i18n/es/primevue.json';

export const LocaleService = {
    languages: {
        es: 'Español',
        en: 'English'
    },
    getLanguageName: (locale) => {
        return LocaleService.languages[locale] ?? locale;
    },
    getPrimevueConfig: (locale) => {
        return locale === 'en' ? enPrimevueLocaleConfig : esPrimevueLocaleConfig;
    }
};
