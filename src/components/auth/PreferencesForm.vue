<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useLayout } from '@/layout/composables/layout';
import { LocaleService } from '@/service/LocaleService';
import { AuthService } from '@/service/AuthService';
import { useToast } from 'primevue/usetoast';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import { usePrimeVue } from 'primevue';

const authStore = useAuthStore();
const toast = useToast();

const { locale, availableLocales, t } = useI18n();
const primevue = usePrimeVue();

const initialValues = ref({
    locale: authStore.user?.preferences?.locale ? authStore.user.preferences.locale : locale,
    theme: authStore.user?.preferences?.theme ? authStore.user.preferences.theme : 'light'
});

const resolver = ref(
    zodResolver(
        z.object({
            locale: z.string(),
            theme: z.string()
        })
    )
);

const loadingErrors = ref([]);
const backendErrors = ref({});
const hasAdditionalErrors = computed(() => loadingErrors.value.length > 0 || Object.entries(backendErrors.value).length > 0);

const submitting = ref(false);
const submit = async ({ valid, values }) => {
    if (!valid) {
        return;
    }

    submitting.value = true;

    try {
        const response = await AuthService.preferences(values);

        if (response.data) {
            toast.add({
                severity: 'success',
                summary: t('profile.preferences.success'),
                life: 3000
            });

            if (!authStore.user.preferences) {
                authStore.user.preferences = {};
            }

            if (authStore.user.preferences.locale !== values.locale) {
                authStore.user.preferences.locale = values.locale;
                locale.value = values.locale;
                primevue.config.locale = LocaleService.getPrimevueConfig(locale.value);
            }
            if (!authStore.user.preferences.theme !== values.theme) {
                authStore.user.preferences.theme = values.theme;

                const { layoutConfig, handleToggleDarkMode } = useLayout();

                if ((layoutConfig.darkTheme && values.theme === 'light') || (!layoutConfig.darkTheme && values.theme === 'dark')) {
                    handleToggleDarkMode();
                }
            }

            localStorage.setItem('user', JSON.stringify(authStore.user));
        }
    } catch (AxiosError) {
        if (AxiosError.response?.status === 422 && AxiosError.response?.data?.errors) {
            backendErrors.value = AxiosError.response.data.errors;
            submitting.value = false;
            return;
        }

        const error = {
            summary: t('profile.preferences.error')
        };

        if (AxiosError.response?.data?.message) {
            error.detail = AxiosError.response.data.message;
        }

        loadingErrors.value.push(error);
        toast.add({
            severity: 'error',
            ...error,
            life: 3000
        });
    }

    submitting.value = false;
};
</script>

<template>
    <Form v-slot="$form" :initial-values="initialValues" :resolver="resolver" @submit="submit" class="space-y-4 max-w-[600px]">
        <div>
            <span class="text-lg font-medium text-surface-950 dark:text-surface-0">{{ t('profile.preferences.title') }}</span>
        </div>
        <div class="flex flex-col gap-4">
            <div v-if="hasAdditionalErrors" class="flex flex-col gap-2">
                <Message
                    v-for="error of loadingErrors"
                    :key="error"
                    severity="error"
                    closable
                    @close="
                        () => {
                            loadingErrors.length = 0;
                        }
                    "
                >
                    <div class="flex flex-col gap-1">
                        {{ error.summary }}
                        <small v-if="error.detail">{{ error.detail }}</small>
                    </div>
                </Message>
            </div>
            <div class="flex flex-col gap-1">
                <label for="user.preferences.locale" class="first-letter:uppercase">{{ t('user.attributes.preferences.locale') }}</label>
                <Select
                    id="user.preferences.locale"
                    name="locale"
                    :default-value="initialValues.locale"
                    :options="availableLocales"
                    :option-label="(locale) => `${locale.toUpperCase()} | ${LocaleService.getLanguageName(locale)}`"
                    placeholder="Select language"
                    :invalid="!!backendErrors.locale || $form.locale?.invalid"
                    @focusin="delete backendErrors.locale"
                />
                <template v-if="$form.locale?.invalid">
                    <Message v-for="error of $form.locale.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                </template>
                <template v-if="backendErrors?.locale">
                    <Message v-for="errorMessage of backendErrors?.locale" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                </template>
            </div>
            <div class="flex flex-col gap-1">
                <div class="flex flex-col gap-1">
                    <span class="first-letter:uppercase">{{ t('user.attributes.preferences.theme') }}</span>
                    <SelectButton
                        name="theme"
                        :options="[{ name: 'light' }, { name: 'dark' }]"
                        :model-value="initialValues.theme"
                        option-value="name"
                        :option-label="(option) => t(`user.preferences.theme.options.${option.name}`)"
                        label-class="first-letter:uppercase"
                        :allow-empty="false"
                    />
                </div>
                <template v-if="$form.theme?.invalid">
                    <Message v-for="error of $form.theme.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                </template>
                <template v-if="backendErrors?.theme">
                    <Message v-for="errorMessage of backendErrors?.theme" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                </template>
            </div>
        </div>
        <Button type="submit" :loading="submitting" :icon="$form.valid && !hasAdditionalErrors ? 'pi pi-check' : null" :label="t('profile.preferences.save')" :disabled="!$form.valid || hasAdditionalErrors || submitting" />
    </Form>
</template>
