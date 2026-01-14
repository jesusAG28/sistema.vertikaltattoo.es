<script setup>
import { onBeforeMount, ref, computed } from 'vue';
import { RoleService } from '@/service/RoleService';
import { useToast } from 'primevue/usetoast';
import AppProgressSpinner from '@/layout/AppProgressSpinner.vue';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import { createRoleFromApi, getRoleSchema, initialRoleState } from '@/clases/role';

const toast = useToast();

const { t } = useI18n();

const props = defineProps({
    id: {
        type: String,
        default: null
    }
});

const role = ref({... initialRoleState});
const resolver = computed(() => zodResolver(getRoleSchema(t)));

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
        const response = await (!props.id ? RoleService.store(values) : RoleService.update(props.id, values));

        if (response.data) {
            toast.add({
                severity: 'success',
                summary: !props.id ? t('role.store.success') : t('role.update.success', { id: props.id }),
                life: 3000
            });

            setTimeout(() => {
                router.push('/roles');
            }, 3000);

        }
    } catch (AxiosError) {
        if (AxiosError.response?.status === 422 && AxiosError.response?.data?.errors) {
            backendErrors.value = AxiosError.response.data.errors;
            submitting.value = false;
            return;
        }

        const error = {
            summary: !props.id ? t('role.store.error') : t('role.update.error', { id: props.id })
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

    if (props.id) {
        await fetchRole();
    }

    loading.value = false;
});

let loadingRole = ref(false);
const fetchRole = async () => {
    loadingRole.value = true;

    try {
        const response = await RoleService.show(props.id);
        if (response.data?.role) {
            role.value = createRoleFromApi(response.data.role);
        }
    } catch (AxiosError) {
        const error = {
            summary: t('role.error', { id: props.id })
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

    loadingRole.value = false;
};

const cancel = () => {
    router.push('/roles');
};

</script>

<template>
    <div v-if="loading" class="flex items-center w-full h-full">
        <AppProgressSpinner />
    </div>
    <div v-else class="card">
        <Form v-slot="$form" :initial-values="role" :resolver="resolver" @submit="submit" class="space-y-4">
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
                    <label for="role.name" class="first-letter:uppercase">{{ t('role.attributes.name') }}</label>
                    <InputText id="role.name" name="name" type="text" :invalid="!!backendErrors.name || $form.name?.invalid" @focusin="delete backendErrors.name" autocomplete="off" />
                    <template v-if="$form.name?.invalid">
                        <Message v-for="error of $form.name.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.name">
                        <Message v-for="errorMessage of backendErrors?.name" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
            </div>

            <Button
                type="submit"
                :loading="submitting"
                :icon="$form.valid && !hasAdditionalErrors ? 'pi pi-check' : null"
                :label="t('role.save')"
                :title="!props.id ? t('role.store.title') : t('role.update.title')"
                :disabled="!$form.valid || hasAdditionalErrors || submitting"
            />
            <Button :label="t('common.buttons.cancel', 'Cancelar')" icon="pi pi-times" class="p-button-secondary ml-2" @click="cancel" :disabled="submitting" />
        </Form>
    </div>
</template>
