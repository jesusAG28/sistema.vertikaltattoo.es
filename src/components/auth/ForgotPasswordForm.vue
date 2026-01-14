<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { AuthService } from '@/service/AuthService';
import { useToast } from 'primevue/usetoast';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import AuthLogoWidget from '@/components/auth/AuthLogoWidget.vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const toast = useToast();

const authStore = useAuthStore();

const { t } = useI18n();

const router = useRouter();

const initialValues = ref({
    email: authStore.remember?.email ?? ''
});

const resolver = ref(
    zodResolver(
        z.object({
            email: z
                .string()
                .nonempty({ message: t('validation.required', { attribute: t('forgot_password.form.email') }) })
                .email({ message: t('validation.email', { attribute: t('forgot_password.form.email') }) })
                .max(255, { message: t('validation.max.string', { attribute: t('forgot_password.form.email') }) })
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
        await AuthService.forgotPassword(values.email);

        router.push('/');
    } catch (AxiosError) {
        if (AxiosError.response?.status === 401) {
            const error = {
                summary: t('forgot_password.error.summary'),
                detail: t('forgot_password.error.credentials.detail')
            };

            loadingErrors.value.push(error);
            submitting.value = false;
            return;
        }

        if (AxiosError.response?.status === 422 && AxiosError.response?.data?.errors) {
            backendErrors.value = AxiosError.response.data.errors;
            submitting.value = false;
            return;
        }

        const error = {
            summary: t('forgot_password.error.summary')
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
    <section class="animate-fadein animate-duration-300 animate-ease-in relative lg:pb-14 lg:py-52 py-36">
        <div class="landing-container mx-auto relative z-10 px-12">
            <div class="relative mt-28 max-w-[36rem] mx-auto">
                <div
                    class="w-full h-full inset-0 bg-white/64 dark:bg-surface-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[4deg] lg:rotate-[7deg] backdrop-blur-[90px] rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)] dark:shadow-sm"
                />
                <div
                    class="w-full h-full inset-0 bg-white/64 dark:bg-surface-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[4deg] lg:-rotate-[7deg] backdrop-blur-[90px] rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)] dark:shadow-sm"
                />
                <Form
                    v-slot="$form"
                    :initialValues
                    :resolver
                    @submit="submit"
                    class="space-y-8 p-8 relative z-10 bg-white/64 dark:bg-surface-800 backdrop-blur-[90px] rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)]"
                >
                    <div class="pt-8 pb-8">
                        <div class="flex items-center justify-center">
                            <AuthLogoWidget />
                        </div>
                        <h1 class="text-4xl lg:text-6xl font-semibold text-surface-950 dark:text-surface-0 text-center">{{ $t('forgot_password.heading') }}</h1>
                        <p class="text-center lg:text-xl text-surface-500 dark:text-white/64 mt-6 max-w-sm mx-auto">{{ $t('forgot_password.heading') }}</p>
                    </div>

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

                    <div class="flex flex-col gap-2">
                        <label for="forgot_email.email" class="font-medium text-surface-500 dark:text-white/64 first-letter:uppercase">{{ $t('forgot_password.form.email') }}</label>
                        <InputText id="forgot_email.email" name="email" fluid :invalid="!!backendErrors.email || $form.email?.invalid" @focusin="delete backendErrors.email" autocomplete="off" />
                        <template v-if="$form.email?.invalid">
                            <Message v-for="error of $form.email.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.email">
                            <Message v-for="errorMessage of backendErrors?.email" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                    <div class="flex items-center">
                        <Button type="submit" :loading="submitting" :icon="$form.valid && !hasAdditionalErrors ? 'pi pi-check' : null" :label="$t('forgot_password.form.submit')" :disabled="!$form.valid || hasAdditionalErrors || submitting" fluid />
                    </div>
                </Form>
            </div>
        </div>
    </section>
</template>
