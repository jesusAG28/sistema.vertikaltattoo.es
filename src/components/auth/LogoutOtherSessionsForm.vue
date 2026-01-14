<script setup>
import { ref, computed } from 'vue';
import { AuthService } from '@/service/AuthService';
import { useToast } from 'primevue/usetoast';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';

const toast = useToast();

const { t } = useI18n();

const initialValues = ref({
    password: ''
});

const resolver = ref(
    zodResolver(
        z.object({
            password: z
                .string()
                .nonempty({ message: t('validation.required', { attribute: t('user.attributes.password') }) })
                .max(255, { message: t('validation.max.string', { attribute: t('user.attributes.password') }) })
        })
    )
);

const loadingErrors = ref([]);
const backendErrors = ref({});
const hasAdditionalErrors = computed(() => loadingErrors.value.length > 0 || Object.entries(backendErrors.value).length > 0);

const submitting = ref(false);
const submit = async ({ valid, values, reset }) => {
    if (!valid) {
        return;
    }

    submitting.value = true;

    try {
        const response = await AuthService.logoutOtherSessions(values);

        if (response.data) {
            toast.add({
                severity: 'success',
                summary: response.data.message ?? t('profile.logout_other_sessions.success'),
                life: 3000
            });

            reset();
        }
    } catch (AxiosError) {
        if (AxiosError.response?.status === 422 && AxiosError.response?.data?.errors) {
            backendErrors.value = AxiosError.response.data.errors;
            submitting.value = false;
            return;
        }

        const error = {
            summary: t('profile.logout_other_sessions.error')
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
            <span class="text-lg font-medium text-surface-950 dark:text-surface-0">{{ t('profile.logout_other_sessions.title') }}</span>
        </div>
        <div v-if="hasAdditionalErrors" class="flex flex-col gap-2">
            <Message v-for="error of loadingErrors" :key="error" severity="error">
                <div class="flex flex-col gap-1">
                    {{ error.summary }}
                    <small v-if="error.detail">{{ error.detail }}</small>
                </div>
            </Message>
        </div>
        <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex flex-col gap-4 flex-grow w-full">
                <div class="flex flex-col gap-1">
                    <label for="profile.logout_other_sessions.password" class="first-letter:uppercase">{{ t('user.attributes.password') }}</label>
                    <Password inputId="profile.logout_other_sessions.password" name="password" toggleMask :feedback="false" fluid @focusin="delete backendErrors.password" />
                    <template v-if="$form.password?.invalid">
                        <Message v-for="error of $form.password.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.password">
                        <Message v-for="errorMessage of backendErrors?.password" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
            </div>
        </div>
        <Button type="submit" :loading="submitting" :icon="$form.valid && !hasAdditionalErrors ? 'pi pi-check' : null" :label="t('profile.logout_other_sessions.save')" :disabled="!$form.valid || hasAdditionalErrors || submitting" />
    </Form>
</template>
