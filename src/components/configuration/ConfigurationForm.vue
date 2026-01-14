<script setup>
import { useToast } from 'primevue';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ConfigurationService } from '@/service/ConfigurationService';
import AppProgressSpinner from '@/layout/AppProgressSpinner.vue';
import z from 'zod';
import { createConfigurationFromApi } from '@/clases/configuration';

const toast = useToast();
const { t } = useI18n();

const resolver = ref(
    zodResolver(
        z.object({
            issuer_alias: z
                .string()
                .nonempty({ message: t('validation.required', { attribute: t('configuration.attributes.issuer_alias') }) })
                .max(255, { message: t('validation.max.string', { attribute: t('configuration.attributes.issuer_alias') }) }),
            issuer_name: z
                .string()
                .nonempty({ message: t('validation.required', { attribute: t('configuration.attributes.issuer_name') }) })
                .max(255, { message: t('validation.max.string', { attribute: t('configuration.attributes.issuer_name') }) }),
            issuer_crn: z
                .string()
                .nonempty({ message: t('validation.required', { attribute: t('configuration.attributes.issuer_crn') }) })
                .max(255, { message: t('validation.max.string', { attribute: t('configuration.attributes.issuer_crn') }) }),
            issuer_address: z
                .string()
                .nonempty({ message: t('validation.required', { attribute: t('configuration.attributes.issuer_address') }) })
                .max(255, { message: t('validation.max.string', { attribute: t('configuration.attributes.issuer_address') }) }),
            issuer_population: z
                .string()
                .nonempty({ message: t('validation.required', { attribute: t('configuration.attributes.issuer_population') }) })
                .max(255, { message: t('validation.max.string', { attribute: t('configuration.attributes.issuer_population') }) }),
            issuer_postal_code: z
                .string()
                .nonempty({ message: t('validation.required', { attribute: t('configuration.attributes.issuer_postal_code') }) })
                .max(255, { message: t('validation.max.string', { attribute: t('configuration.attributes.issuer_postal_code') }) }),
            issuer_province: z
                .string()
                .nonempty({ message: t('validation.required', { attribute: t('configuration.attributes.issuer_province') }) })
                .max(255, { message: t('validation.max.string', { attribute: t('configuration.attributes.issuer_province') }) }),
            issuer_phone: z
                .string()
                .nonempty({ message: t('validation.required', { attribute: t('configuration.attributes.issuer_phone') }) })
                .max(255, { message: t('validation.max.string', { attribute: t('configuration.attributes.issuer_phone') }) }),
            issuer_email: z
                .string()
                .nonempty({ message: t('validation.required', { attribute: t('configuration.attributes.issuer_email') }) })
                .max(255, { message: t('validation.max.string', { attribute: t('configuration.attributes.issuer_email') }) })
        })
    )
);

const loadingErrors = ref([]);
const backendErrors = ref({});
const hasAdditionalErrors = computed(() => loadingErrors.value.length > 0 || Object.entries(backendErrors.value).length > 0);

const configuration = ref({
    issuer_alias: '',
    issuer_name: '',
    issuer_crn: '',
    issuer_address: '',
    issuer_population: '',
    issuer_province: '',
    issuer_postal_code: '',
    issuer_phone: '',
    issuer_email: ''
});

const modify_issuer_LAF = ref(false);
const submitting = ref(false);
const submit = async ({ valid, values }) => {
    if (!valid) {
        return;
    }

    submitting.value = true;

    try {
        const response = await ConfigurationService.update(createConfigurationFromApi(values));

        if (response.data) {
            toast.add({
                severity: 'success',
                summary: t('configuration.update.success', { id: 0 }),
                life: 3000
            });
        }
    } catch (AxiosError) {
        if (AxiosError.response?.status === 422 && AxiosError.response?.data?.errors) {
            backendErrors.value = AxiosError.response.data.errors;
            submitting.value = false;
            return;
        }

        const error = {
            summary: t('configuration.update.error', { id: 0 })
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

const loading = ref(false);
onBeforeMount(async () => {
    loading.value = true;

    await fetchConfiguration();

    loading.value = false;
});

const loadingconfiguration = ref(false);
const fetchConfiguration = async () => {
    loadingconfiguration.value = true;

    try {
        const response = await ConfigurationService.index();

        if (response.data?.configuration) {
            configuration.value = response.data.configuration;
            modify_issuer_LAF.value = response.data.modify_issuer_LAF;
        }
    } catch (AxiosError) {
        const error = {
            summary: t('configuration.error', { id: 0 })
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

    loadingconfiguration.value = false;
};
</script>

<template>
    <div v-if="loading" class="flex items-center w-full h-full">
        <AppProgressSpinner />
    </div>
    <div v-else class="card">
        <Form v-slot="$form" :initial-values="configuration" :resolver="resolver" @submit="submit" class="space-y-4">
            <div class="flex flex-col gap-4">
                <div v-if="hasAdditionalErrors" class="flex flex-col gap-2">
                    <Message v-for="error of loadingErrors" :key="error" severity="error">
                        <div class="flex flex-col gap-1">
                            {{ error.summary }}
                            <small v-if="error.detail">{{ error.detail }}</small>
                        </div>
                    </Message>
                </div>

                <div class="flex flex-col gap-1">
                    <label for="configuration.issuer_alias" class="first-letter:uppercase">
                        {{ t('configuration.attributes.issuer_alias') }}
                    </label>

                    <InputText id="configuration.issuer_alias" name="issuer_alias" type="text" :invalid="!!backendErrors.issuer_alias || $form.issuer_alias?.invalid" @focusin="delete backendErrors.issuer_alias" />

                    <template v-if="$form.issuer_alias?.invalid">
                        <Message v-for="error of $form.issuer_alias.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.issuer_alias">
                        <Message v-for="errorMessage of backendErrors?.issuer_alias" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>

                <div class="flex flex-col gap-1">
                    <label for="configuration.issuer_name" class="first-letter:uppercase">
                        {{ t('configuration.attributes.issuer_name') }}
                    </label>

                    <InputText id="configuration.issuer_name" name="issuer_name" type="text" :disabled="!modify_issuer_LAF" :invalid="!!backendErrors.issuer_name || $form.issuer_name?.invalid" @focusin="delete backendErrors.issuer_name" />

                    <template v-if="$form.issuer_name?.invalid">
                        <Message v-for="error of $form.issuer_name.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.issuer_name">
                        <Message v-for="errorMessage of backendErrors?.issuer_name" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
                <div class="flex flex-col gap-1">
                    <label for="configuration.issuer_crn" class="first-letter:uppercase">
                        {{ t('configuration.attributes.issuer_crn') }}
                    </label>

                    <InputText id="configuration.issuer_crn" name="issuer_crn" type="text" :disabled="!modify_issuer_LAF" :invalid="!!backendErrors.issuer_crn || $form.issuer_crn?.invalid" @focusin="delete backendErrors.issuer_crn" />

                    <template v-if="$form.issuer_crn?.invalid">
                        <Message v-for="error of $form.issuer_crn.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.issuer_crn">
                        <Message v-for="errorMessage of backendErrors?.issuer_crn" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
                <div class="flex flex-col gap-1">
                    <label for="configuration.issuer_address" class="first-letter:uppercase">
                        {{ t('configuration.attributes.issuer_address') }}
                    </label>

                    <InputText id="configuration.issuer_address" name="issuer_address" type="text" :invalid="!!backendErrors.issuer_address || $form.issuer_address?.invalid" @focusin="delete backendErrors.issuer_address" />

                    <template v-if="$form.issuer_address?.invalid">
                        <Message v-for="error of $form.issuer_address.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.issuer_address">
                        <Message v-for="errorMessage of backendErrors?.issuer_address" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>

                <div class="flex flex-col gap-1">
                    <label for="configuration.issuer_population" class="first-letter:uppercase">
                        {{ t('configuration.attributes.issuer_population') }}
                    </label>

                    <InputText id="configuration.issuer_population" name="issuer_population" type="text" :invalid="!!backendErrors.issuer_population || $form.issuer_population?.invalid" @focusin="delete backendErrors.issuer_population" />

                    <template v-if="$form.issuer_population?.invalid">
                        <Message v-for="error of $form.issuer_population.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.issuer_population">
                        <Message v-for="errorMessage of backendErrors?.issuer_population" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
                <div class="flex flex-col gap-1">
                    <label for="configuration.issuer_province" class="first-letter:uppercase">
                        {{ t('configuration.attributes.issuer_province') }}
                    </label>

                    <InputText id="configuration.issuer_province" name="issuer_province" type="text" :invalid="!!backendErrors.issuer_province || $form.issuer_province?.invalid" @focusin="delete backendErrors.issuer_province" />

                    <template v-if="$form.issuer_province?.invalid">
                        <Message v-for="error of $form.issuer_province.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.issuer_province">
                        <Message v-for="errorMessage of backendErrors?.issuer_province" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
                <div class="flex flex-col gap-1">
                    <label for="configuration.issuer_postal_code" class="first-letter:uppercase">
                        {{ t('configuration.attributes.issuer_postal_code') }}
                    </label>

                    <InputText id="configuration.issuer_postal_code" name="issuer_postal_code" type="text" :invalid="!!backendErrors.issuer_postal_code || $form.issuer_postal_code?.invalid" @focusin="delete backendErrors.issuer_postal_code" />

                    <template v-if="$form.issuer_postal_code?.invalid">
                        <Message v-for="error of $form.issuer_postal_code.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.issuer_postal_code">
                        <Message v-for="errorMessage of backendErrors?.issuer_postal_code" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
                <div class="flex flex-col gap-1">
                    <label for="configuration.issuer_phone" class="first-letter:uppercase">
                        {{ t('configuration.attributes.issuer_phone') }}
                    </label>

                    <InputText id="configuration.issuer_phone" name="issuer_phone" type="text" :invalid="!!backendErrors.issuer_phone || $form.issuer_phone?.invalid" @focusin="delete backendErrors.issuer_phone" />

                    <template v-if="$form.issuer_phone?.invalid">
                        <Message v-for="error of $form.issuer_phone.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.issuer_phone">
                        <Message v-for="errorMessage of backendErrors?.issuer_phone" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
                <div class="flex flex-col gap-1">
                    <label for="configuration.issuer_email" class="first-letter:uppercase">
                        {{ t('configuration.attributes.issuer_email') }}
                    </label>

                    <InputText id="configuration.issuer_email" name="issuer_email" type="text" :invalid="!!backendErrors.issuer_email || $form.issuer_email?.invalid" @focusin="delete backendErrors.issuer_email" />

                    <template v-if="$form.issuer_email?.invalid">
                        <Message v-for="error of $form.issuer_email.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.issuer_email">
                        <Message v-for="errorMessage of backendErrors?.issuer_email" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
            </div>

            <Button
                type="submit"
                :loading="submitting"
                :icon="$form.valid && !hasAdditionalErrors ? 'pi pi-check' : null"
                :label="t('configuration.save')"
                :title="t('configuration.update.title')"
                :disabled="!$form.valid || hasAdditionalErrors || submitting"
            />
        </Form>
    </div>
</template>
