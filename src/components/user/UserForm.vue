<script setup>
import { onBeforeMount, ref, computed } from 'vue';
import { UserService } from '@/service/UserService';
import { LocaleService } from '@/service/LocaleService';
import { useToast } from 'primevue/usetoast';
import AppProgressSpinner from '@/layout/AppProgressSpinner.vue';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import { createUserFromApi, getUserSchema, initialUserState } from '@/clases/user';

const toast = useToast();

const { availableLocales, t } = useI18n();

const props = defineProps({
    id: {
        type: String,
        default: null
    }
});

const user = ref({ ...initialUserState });
const resolver = computed(() => zodResolver(getUserSchema(t, props?.id ? false : true)));

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
        const response = await (!props.id ? UserService.store(values) : UserService.update(props.id, values));

        if (response.data) {
            toast.add({
                severity: 'success',
                summary: !props.id ? t('user.store.success') : t('user.update.success', { id: props.id }),
                life: 3000
            });

            setTimeout(() => {
                router.replace('/users');
            }, 3000);
        }
    } catch (AxiosError) {
        if (AxiosError.response?.status === 422 && AxiosError.response?.data?.errors) {
            backendErrors.value = AxiosError.response.data.errors;
            submitting.value = false;
            return;
        }

        const error = {
            summary: !props.id ? t('user.store.error') : t('user.update.error', { id: props.id })
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

    // fetchRoles();

    if (props.id) {
        await fetchUser();
    }

    loading.value = false;
});

const loadingUser = ref(false);
const fetchUser = async () => {
    loadingUser.value = true;

    try {
        const response = await UserService.show(props.id);

        if (response.data?.user) {
            user.value = createUserFromApi(response.data.user);
        }
    } catch (AxiosError) {
        const error = {
            summary: t('user.error', { id: props.id })
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

    loadingUser.value = false;
};

// const { items: roles, loading: loadingRoles, fetchData: fetchRoles} = useSelectData(
//     RoleService.list,
//     {
//         toast,
//         i18n: { t },
//         errorMsgKey: 'user.roles.error',
//         dataValue: 'roles'
//     }
// );

const cancel = () => router.replace('/users');
</script>

<template>
    <div v-if="loading" class="flex items-center w-full h-full">
        <AppProgressSpinner />
    </div>
    <div v-else class="card">
        <Form v-slot="$form" :initial-values="user" :resolver="resolver" @submit="submit" class="space-y-4">
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
                <div class="flex flex-col gap-1">
                    <label for="user.password" class="first-letter:uppercase">{{ t('user.attributes.password') }}</label>
                    <Password id="user.password" name="password" type="text" toggleMask :feedback="false" fluid @focusin="delete backendErrors.password" autocomplete="off" />
                    <template v-if="$form.password?.invalid">
                        <Message v-for="error of $form.password.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.password">
                        <Message v-for="errorMessage of backendErrors?.password" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
                <div class="flex flex-col gap-1">
                    <label for="user.password_confirmation" class="first-letter:uppercase">{{ t('user.attributes.password_confirmation') }}</label>
                    <Password
                        id="user.password_confirmation"
                        name="password_confirmation"
                        type="text"
                        toggleMask
                        :feedback="false"
                        fluid
                        :invalid="!!backendErrors.password_confirmation || $form.password_confirmation?.invalid"
                        @focusin="delete backendErrors.password_confirmation"
                        autocomplete="off"
                    />
                    <template v-if="$form.password_confirmation?.invalid">
                        <Message v-for="error of $form.password_confirmation.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.password_confirmation">
                        <Message v-for="errorMessage of backendErrors?.password_confirmation" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
                <!-- <div class="flex flex-col gap-1">
                    <label for="user.roles" class="first-letter:uppercase">{{ t('user.attributes.roles') }}</label>
                    <MultiSelect
                        input-id="user.roles"
                        name="roles"
                        :options="roles"
                        option-label="name"
                        option-value="name"
                        display="chip"
                        :placeholder="loadingRoles ? t('user.roles.placeholder.loading') : t('user.roles.placeholder.multiple')"
                        :filter="true"
                        :loading="loadingRoles"
                        :invalid="!!backendErrors.roles || $form.roles?.invalid"
                        @focus="delete backendErrors.roles"
                    />
                    <template v-if="$form.roles?.invalid">
                        <Message v-for="error of $form.roles.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.roles">
                        <Message v-for="errorMessage of backendErrors?.roles" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div> -->
                <div class="flex flex-col gap-1">
                    <label for="user.active" class="first-letter:uppercase">{{ t('user.attributes.active') }}</label>
                    <ToggleSwitch input-id="user.active" name="active" :invalid="!!backendErrors.active || $form.active?.invalid" @focus="delete backendErrors.active" />
                    <template v-if="$form.active?.invalid">
                        <Message v-for="error of $form.active.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.active">
                        <Message v-for="errorMessage of backendErrors?.active" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
                <div class="flex flex-col gap-1">
                    <label for="user.preferences.locale" class="first-letter:uppercase">{{ t('user.attributes.preferences.locale') }}</label>
                    <Select
                        id="user.preferences.locale"
                        name="preferences.locale"
                        :default-value="user.preferences.locale"
                        :options="availableLocales"
                        :option-label="(locale) => `${locale.toUpperCase()} | ${LocaleService.getLanguageName(locale)}`"
                        placeholder="Select language"
                        :invalid="!!backendErrors['preferences.locale'] || $form['preferences.locale']?.invalid"
                        @focusin="delete backendErrors['preferences.locale']"
                    />
                    <template v-if="$form['preferences.locale']?.invalid">
                        <Message v-for="error of $form['preferences.locale'].errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.['preferences.locale']">
                        <Message v-for="errorMessage of backendErrors?.['preferences.locale']" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
                <div class="flex flex-col gap-1">
                    <div class="flex flex-col gap-1">
                        <span class="first-letter:uppercase">{{ t('user.attributes.preferences.theme') }}</span>
                        <SelectButton
                            name="preferences.theme"
                            :options="[{ name: 'light' }, { name: 'dark' }]"
                            :model-value="user.preferences.theme"
                            option-value="name"
                            :option-label="(option) => t(`user.preferences.theme.options.${option.name}`)"
                            :allow-empty="false"
                        />
                    </div>
                    <template v-if="$form['preferences.theme']?.invalid">
                        <Message v-for="error of $form['preferences.theme'].errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.['preferences.theme']">
                        <Message v-for="errorMessage of backendErrors?.['preferences.theme']" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>
            </div>

            <Button
                type="submit"
                :loading="submitting"
                :icon="$form.valid && !hasAdditionalErrors ? 'pi pi-check' : null"
                :label="t('user.save')"
                :title="!props.id ? t('user.store.title') : t('user.update.title')"
                :disabled="!$form.valid || hasAdditionalErrors || submitting"
            />
            <Button :label="t('common.buttons.cancel', 'Cancelar')" icon="pi pi-times" class="p-button-secondary ml-2" @click="cancel" :disabled="submitting" />
        </Form>
    </div>
</template>
