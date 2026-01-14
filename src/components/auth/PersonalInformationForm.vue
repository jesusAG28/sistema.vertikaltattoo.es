<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { AuthService } from '@/service/AuthService';
import { useToast } from 'primevue/usetoast';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import ImageUpload from '../ui/ImageUpload.vue';

const authStore = useAuthStore();
const toast = useToast();

const { t } = useI18n();

const initialValues = ref({
    name: authStore.user?.name ? authStore.user.name : '',
    email: authStore.user?.email ? authStore.user.email : ''
});

const imageUploadId = ref(null);
const imageUnlink = ref(false);

const resolver = ref(
    zodResolver(
        z.object({
            // firstname: z
            //     .string()
            //     .nonempty({ message: t('validation.required', { attribute: t('user.attributes.firstname') }) })
            //     .max(255, { message: t('validation.max.string', { attribute: t('user.attributes.firstname') }) }),
            // lastname: z
            //     .string()
            //     .nonempty({ message: t('validation.required', { attribute: t('user.attributes.lastname') }) })
            //     .max(255, { message: t('validation.max.string', { attribute: t('user.attributes.lastname') }) }),
            name: z
                .string()
                .nonempty({ message: t('validation.required', { attribute: t('user.attributes.name') }) })
                .max(255, { message: t('validation.max.string', { attribute: t('user.attributes.name') }) }),
            email: z
                .string()
                .nonempty({ message: t('validation.required', { attribute: t('user.attributes.email') }) })
                .email({ message: t('validation.email', { attribute: t('user.attributes.email') }) })
                .max(255, { message: t('validation.max.string', { attribute: t('user.attributes.email') }) })
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
        const response = await AuthService.personalInformation({
            ...values,
            image_upload_id: imageUploadId.value,
            image_unlink: imageUnlink.value
        });

        if (response.data) {
            toast.add({
                severity: 'success',
                summary: t('profile.personal_information.success'),
                life: 3000
            });

            // authStore.user.firstname = values.firstname;
            // authStore.user.lastname = values.lastname;
            authStore.user.name = values.name;
            authStore.user.email = values.email;
            authStore.user.image = response.data.user.image;

            localStorage.setItem('user', JSON.stringify(authStore.user));
        }
    } catch (AxiosError) {
        if (AxiosError.response?.status === 422 && AxiosError.response?.data?.errors) {
            backendErrors.value = AxiosError.response.data.errors;
            submitting.value = false;
            return;
        }

        const error = {
            summary: t('profile.personal_information.error')
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
            <span class="text-lg font-medium text-surface-950 dark:text-surface-0">{{ t('profile.personal_information.title') }}</span>
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
            <div class="w-full sm:w-72 flex flex-col gap-1">
                <div>
                    <span class="first-letter:uppercase">{{ t('user.attributes.image') }}</span>
                </div>
                <ImageUpload :image="authStore.user?.image ? `${authStore.assetsBaseUrl}${authStore.user.image}` : null" v-model:upload-id="imageUploadId" v-model:unlink="imageUnlink" rounded />
            </div>
            <div class="flex flex-col gap-4 flex-grow w-full">
                <div class="flex flex-col gap-1">
                    <label for="user.name" class="first-letter:uppercase">{{ t('user.attributes.name') }}</label>
                    <InputText id="user.name" name="name" type="text" :invalid="!!backendErrors.name || $form.name?.invalid" @focusin="delete backendErrors.name" autocomplete="off" />
                    <template v-if="$form.name?.invalid">
                        <Message v-for="error of $form.name.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.name">
                        <Message v-for="errorMessage of backendErrors?.name" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
                <div class="flex flex-col gap-1">
                    <label for="user.email" class="first-letter:uppercase">{{ t('user.attributes.email') }}</label>
                    <InputText id="user.email" name="email" type="text" :invalid="!!backendErrors.email || $form.email?.invalid" @focusin="delete backendErrors.email" autocomplete="off" />
                    <template v-if="$form.email?.invalid">
                        <Message v-for="error of $form.email.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.email">
                        <Message v-for="errorMessage of backendErrors?.email" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
            </div>
        </div>
        <Button type="submit" :loading="submitting" :icon="$form.valid && !hasAdditionalErrors ? 'pi pi-check' : null" :label="t('profile.personal_information.save')" :disabled="!$form.valid || hasAdditionalErrors || submitting" />
    </Form>
</template>
