import { ref, watch, computed } from 'vue';
import { defineStore } from 'pinia';
import router from '@/router';
import { baseUrl } from '@/service/ApiService';
import { useSettingsStore } from './settings';
import { AuthService } from '@/service/AuthService';
import i18n from '@/i18n';
import { useLayout } from '@/layout/composables/layout';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('user')));

    const setUser = (value) => {
        user.value = value;
        localStorage.setItem('user', JSON.stringify(user.value));
    };

    const unsetUser = () => {
        user.value = null;
        localStorage.removeItem('user');
    };

    const login = (data) => {
        if (data.user?.preferences?.locale && data.user.preferences.locale !== i18n.global.locale.value && i18n.global.availableLocales.includes(data.user.preferences.locale)) {
            i18n.global.locale.value = data.user.preferences.locale;
        }

        setUser({
            ...data.user,
            token: data.token,
            support_token: data.support_token,
            roles: data.roles,
            permissions: data.permissions
        });

        if (rememberMe.value && user.value) {
            setRemember(user.value.email);
        }

        router.push(returnUrl.value || '/');
    };

    const logout = () => {
        unsetUser();

        const settingsStore = useSettingsStore();

        settingsStore.reset();

        router.push('/login');
    };

    const overrideSettings = (preferences) => {
        const settingsStore = useSettingsStore();

        if (preferences.dataTable?.rows) {
            settingsStore.dataTable.rows = preferences.dataTable.rows;
        }

        if (preferences.dataTable?.rowsPerPageOptions) {
            settingsStore.dataTable.rowsPerPageOptions = preferences.dataTable.rowsPerPageOptions;
        }
    };

    const { layoutConfig, handleToggleDarkMode } = useLayout();

    if (user.value) {
        if ((!user.value?.preferences?.theme && layoutConfig.darkTheme) || (!user.value?.preferences?.theme === 'light' && layoutConfig.darkTheme) || (user.value?.preferences?.theme === 'dark' && !layoutConfig.darkTheme)) {
            handleToggleDarkMode();
        }

        AuthService.user().then((response) => {
            if (response.data?.user?.preferences) {
                overrideSettings(response.data.user.preferences);
            }

            if (response.data?.user?.preferences?.locale && response.data.user.preferences.locale !== i18n.global.locale.value && i18n.global.availableLocales.includes(response.data.user.preferences.locale)) {
                i18n.global.locale.value = response.data.user.preferences.locale;
            }

            if (
                (!response.data?.user?.preferences?.theme && layoutConfig.darkTheme) ||
                (!response.data?.user?.preferences?.theme === 'light' && layoutConfig.darkTheme) ||
                (response.data?.user?.preferences?.theme === 'dark' && !layoutConfig.darkTheme)
            ) {
                handleToggleDarkMode();
            }

            setUser({
                ...response.data.user,
                token: user.value.token,
                support_token: response.data.user.support_token,
                roles: response.data.roles,
                permissions: response.data.permissions
            });
        });
    } else {
        handleToggleDarkMode();
    }

    const remember = ref(JSON.parse(localStorage.getItem('remember')));

    const setRemember = (email) => {
        remember.value = {
            email: email
        };
        localStorage.setItem('remember', JSON.stringify(remember.value));
    };

    const unsetRemember = () => {
        remember.value = null;
        localStorage.removeItem('remember');
    };

    const rememberMe = ref(!!remember.value);

    const toggleRememberMe = () => {
        rememberMe.value = !rememberMe.value;
    };

    watch(rememberMe, () => {
        if (!rememberMe.value && remember.value) {
            unsetRemember();
        } else if (rememberMe.value && user.value) {
            setRemember(user.value.email);
        }
    });

    const assetsBaseUrl = computed(() => {
        // return user.value ? `${baseUrl}/${user.value.id}/assets` : `${baseUrl}/assets/`;
        return `${baseUrl}/storage`;
    });

    const returnUrl = ref(null);

    return { user, login, logout, remember, rememberMe, toggleRememberMe, assetsBaseUrl };
});
