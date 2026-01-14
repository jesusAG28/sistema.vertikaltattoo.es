<script setup>
import { onBeforeMount, ref, computed } from 'vue';
import { EntityService } from '@/service/EntityService';
import { useToast } from 'primevue/usetoast';
import AppProgressSpinner from '@/layout/AppProgressSpinner.vue';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import { useSelectData } from '@/composables/useSelectData';
import { createEntityFromApi, getEntitySchema, initialEntityState } from '@/clases/entity';
import { PaymentMethodsService } from '@/service/PaymentMethodsService';

const toast = useToast();
const { t } = useI18n();

const props = defineProps({
    id: {
        type: String,
        default: null
    }
});

const entity = ref({ ...initialEntityState });
const resolver = ref(zodResolver(getEntitySchema(t)));

const loadingErrors = ref([]);
const backendErrors = ref({});
const hasAdditionalErrors = computed(() => loadingErrors.value.length > 0 || Object.entries(backendErrors.value).length > 0);

const submitting = ref(false);
const submit = async ({valid, values}) => {
    if (!valid) {
        return;
    }
    
    submitting.value = true;

    try {
        const response = await (!props.id ? EntityService.store(values) : EntityService.update(props.id, values));

        if (response.data) {
            toast.add({
                severity: 'success',
                summary: !props.id ? t('entity.store.success') : t('entity.update.success', { id: props.id }),
                life: 3000
            });

            setTimeout(() => {
                router.push('/entities');
            }, 3000);
        }
    } catch (AxiosError) {
        if (AxiosError.response?.status === 422 && AxiosError.response?.data?.errors) {
            backendErrors.value = AxiosError.response.data.errors;
            submitting.value = false;
            return;
        }

        const error = {
            summary: !props.id ? t('entity.store.error') : t('entity.update.error', { id: props.id })
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

    fetchPaymentMethods();

    if (props.id) {
        await fetchEntity();
    }

    loading.value = false;
});

const loadingEntity = ref(false);
const fetchEntity = async () => {
    loadingEntity.value = true;

    try {
        const response = await EntityService.show(props.id);

        if (response.data?.entity) {
            let ent = createEntityFromApi(response.data.entity);
            ent.payment_method_id = ent.payment_method_id?.id ?? ent.payment_method_id;
            ent.emails_sending_invoice = Array.isArray(ent.emails_sending_invoice) ? ent.emails_sending_invoice.join(',') : '';
            entity.value = ent;
        }
    } catch (AxiosError) {
        const error = {
            summary: t('entity.error', { id: props.id })
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

    loadingEntity.value = false;
};

const { items: payment_methods, loading: loadingPaymentMethods, fetchData: fetchPaymentMethods } = useSelectData(
    PaymentMethodsService.list,
    {
        toast,
        i18n: { t },
        errorMsgKey: 'entity.payment_method.error',
        dataValue: 'payment_methods'
    }
);

const cancel = () => {
    router.replace('/entities');
};
</script>

<template>
    <div v-if="loading" class="flex items-center w-full h-full">
        <AppProgressSpinner />
    </div>
    <div v-else class="card p-8">
        <Form v-slot="$form" :initial-values="entity" :resolver="resolver" @submit="submit" class="space-y-4">
            <div class="flex flex-col gap-4">
                <div v-if="hasAdditionalErrors" class="flex flex-col gap-2">
                    <Message v-for="error of loadingErrors" :key="error" severity="error">
                        <div class="flex flex-col gap-1">
                            {{ error.summary }}
                            <small v-if="error.detail">{{ error.detail }}</small>
                        </div>
                    </Message>
                </div>

                <div class="flex flex-row gap-4">
                    <div class="flex flex-col basis-[45%] gap-1">
                        <FloatLabel variant="in">
                            <label for="entity.name" class="first-letter:uppercase">{{ t('entity.attributes.name') }}</label>
                            <InputText id="entity.name" name="name" type="text"
                                :invalid="!!backendErrors.name || $form.name?.invalid"
                                @focusin="delete backendErrors.name" autocomplete="off" size="large" fluid />
                        </FloatLabel>

                        <template v-if="$form.name?.invalid">
                            <Message v-for="error of $form.name.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.name">
                            <Message v-for="errorMessage of backendErrors?.name" :key="errorMessage" severity="error"
                                size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col basis-[30%] gap-1">
                        <FloatLabel variant="in">
                            <label for="entity.alias" class="first-letter:uppercase">{{ t('entity.attributes.alias') }}</label>
                            <InputText id="entity.alias" name="alias" type="text"
                                :invalid="!!backendErrors.alias || $form.alias?.invalid"
                                @focusin="delete backendErrors.alias" size="large" autocomplete="off" fluid />
                        </FloatLabel>
                        <template v-if="$form.alias?.invalid">
                            <Message v-for="error of $form.alias.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.alias">
                            <Message v-for="errorMessage of backendErrors?.alias" :key="errorMessage" severity="error"
                                size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                    <div class="flex flex-col basis-[10%] gap-1">
                        <FloatLabel variant="in">
                            <label for="entity.crn" class="first-letter:uppercase">{{ t('entity.attributes.crn') }}</label>
                            <InputText id="entity.crn" name="crn" type="text"
                                :invalid="!!backendErrors.crn || $form.crn?.invalid" @focusin="delete backendErrors.crn"
                                size="large" autocomplete="off" fluid />
                        </FloatLabel>
                        <template v-if="$form.crn?.invalid">
                            <Message v-for="error of $form.crn.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.crn">
                            <Message v-for="errorMessage of backendErrors?.crn" :key="errorMessage" severity="error"
                                size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>

                <div class="flex flex-row gap-4">
                    <div class="flex flex-col basis-[20%] gap-1">
                        <FloatLabel variant="in">
                            <label for="entity.emails" class="first-letter:uppercase">{{ t('entity.attributes.emails') }}</label>
                            <InputText id="entity.emails" name="emails" type="text"
                                :invalid="!!backendErrors.emails || $form.emails?.invalid"
                                @focusin="delete backendErrors.emails" size="large" autocomplete="off" fluid />
                        </FloatLabel>
                        <template v-if="$form.emails?.invalid">
                            <Message v-for="error of $form.emails.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.emails">
                            <Message v-for="errorMessage of backendErrors?.emails" :key="errorMessage" severity="error"
                                size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                    <div class="flex flex-col basis-[35%] gap-1">
                        <FloatLabel variant="in">
                            <label for="entity.emails_sending_invoice" class="first-letter:uppercase">{{ t('entity.attributes.emails_sending_invoice') }}</label>
                            <InputText
                                id="entity.emails_sending_invoice"
                                name="emails_sending_invoice"
                                type="text"
                                :invalid="!!backendErrors.emails_sending_invoice || $form.emails_sending_invoice?.invalid"
                                @focusin="delete backendErrors.emails_sending_invoice"
                                size="large"
                                autocomplete="off"
                                fluid
                            />
                        </FloatLabel>
                        <template v-if="$form.emails_sending_invoice?.invalid">
                            <Message v-for="error of $form.emails_sending_invoice.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.emails">
                            <Message v-for="errorMessage of backendErrors?.emails" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                    <div class="flex flex-col basis-[15%] gap-1">
                        <FloatLabel variant="in">
                            <label for="entity.phone" class="first-letter:uppercase">{{ t('entity.attributes.phone') }}</label>
                            <InputText id="entity.phone" name="phone" type="text"
                                :invalid="!!backendErrors.phone || $form.phone?.invalid"
                                @focusin="delete backendErrors.phone" size="large" autocomplete="off" fluid />
                        </FloatLabel>
                        <template v-if="$form.phone?.invalid">
                            <Message v-for="error of $form.phone.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.phone">
                            <Message v-for="errorMessage of backendErrors?.phone" :key="errorMessage" severity="error"
                                size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                    <div class="flex flex-col basis-[30%] gap-1">
                        <FloatLabel variant="in">
                            <label for="entity.website" class="first-letter:uppercase">{{ t('entity.attributes.website') }}</label>
                            <InputText id="entity.website" name="website" type="text"
                                :invalid="!!backendErrors.website || $form.website?.invalid"
                                @focusin="delete backendErrors.website" size="large" autocomplete="off" fluid />
                        </FloatLabel>
                        <template v-if="$form.website?.invalid">
                            <Message v-for="error of $form.website.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.website">
                            <Message v-for="errorMessage of backendErrors?.website" :key="errorMessage" severity="error"
                                size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>

                <div class="flex flex-row gap-4">
                    <div class="flex flex-col basis-[50%] gap-1">
                        <FloatLabel variant="in">
                            <label for="entity.address" class="first-letter:uppercase">{{ t('entity.attributes.address') }}</label>
                            <InputText id="entity.address" name="address" type="text"
                                :invalid="!!backendErrors.address || $form.address?.invalid"
                                @focusin="delete backendErrors.address" size="large" autocomplete="off" fluid />
                        </FloatLabel>
                        <template v-if="$form.address?.invalid">
                            <Message v-for="error of $form.address.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.address">
                            <Message v-for="errorMessage of backendErrors?.address" :key="errorMessage" severity="error"
                                size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                    <div class="flex flex-col basis-[20%] gap-1">
                        <FloatLabel variant="in">
                            <label for="entity.province" class="first-letter:uppercase">{{ t('entity.attributes.province') }}</label>
                            <InputText id="entity.province" name="province" type="text"
                                :invalid="!!backendErrors.province || $form.province?.invalid"
                                @focusin="delete backendErrors.province" size="large" autocomplete="off" fluid />
                        </FloatLabel>
                        <template v-if="$form.province?.invalid">
                            <Message v-for="error of $form.province.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.province">
                            <Message v-for="errorMessage of backendErrors?.province" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                    <div class="flex flex-col basis-[20%] gap-1">
                        <FloatLabel variant="in">
                            <label for="entity.population" class="first-letter:uppercase">{{ t('entity.attributes.population') }}</label>
                            <InputText id="entity.population" name="population" type="text"
                                :invalid="!!backendErrors.population || $form.population?.invalid"
                                @focusin="delete backendErrors.population" size="large" autocomplete="off" fluid />
                        </FloatLabel>
                        <template v-if="$form.population?.invalid">
                            <Message v-for="error of $form.population.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.population">
                            <Message v-for="errorMessage of backendErrors?.population" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col basis-[8%] gap-1">
                        <FloatLabel variant="in">
                            <label for="entity.postal_code" class="first-letter:uppercase">{{ t('entity.attributes.postal_code') }}</label>
                            <InputText id="entity.postal_code" name="postal_code" type="text"
                                :invalid="!!backendErrors.postal_code || $form.postal_code?.invalid"
                                @focusin="delete backendErrors.postal_code" size="large" autocomplete="off" fluid
                                v-keyfilter.int />
                        </FloatLabel>
                        <template v-if="$form.postal_code?.invalid">
                            <Message v-for="error of $form.postal_code.errors" :key="error" severity="error"
                                size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.postal_code">
                            <Message v-for="errorMessage of backendErrors?.postal_code" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>

                <div class="flex flex-row gap-4">
                    <div class="flex flex-col basis-[15%] gap-1">
                        <FloatLabel variant="in">
                            <Select
                                id="entity.payment_method_id"
                                name="payment_method_id"
                                :options="payment_methods"
                                option-value="id"
                                option-label="name"
                                :loading="loadingPaymentMethods"
                                :invalid="!!backendErrors.payment_method_id || $form.payment_method_id?.invalid"
                                @focusin="delete backendErrors.payment_method_id"
                                fluid
                            />
                            <label for="entity.payment_method_id" class="first-letter:uppercase">{{ t('entity.attributes.payment_method') }}</label>
                        </FloatLabel>
                        <template v-if="$form.payment_method_id?.invalid">
                            <Message v-for="error of $form.payment_method_id.errors" :key="error" severity="error"
                                size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.payment_method_id">
                            <Message v-for="errorMessage of backendErrors?.payment_method_id" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col basis-[10%] gap-1">
                        <FloatLabel variant="in">
                            <InputNumber
                                id="entity.payment_due_days"
                                name="payment_due_days"
                                type="text"
                                :invalid="!!backendErrors.payment_due_days || $form.payment_due_days?.invalid"
                                @focusin="delete backendErrors.payment_due_days"
                                :min-fraction-digits="0"
                                :min="0"
                                size="large"
                                autocomplete="off"
                                fluid
                            />
                            <label for="entity.payment_due_days" class="first-letter:uppercase">{{ t('entity.attributes.payment_due_days') }}</label>
                        </FloatLabel>
                        <template v-if="$form.payment_due_days?.invalid">
                            <Message v-for="error of $form.payment_due_days.errors" :key="error" severity="error"
                                size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.payment_due_days">
                            <Message v-for="errorMessage of backendErrors?.payment_due_days" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col basis-[20%] gap-1">
                        <FloatLabel variant="in">
                            <label for="entity.bank_account_number" class="first-letter:uppercase">{{ t('entity.attributes.bank_account_number') }}</label>
                            <InputText
                                id="entity.bank_account_number"
                                name="bank_account_number"
                                type="text"
                                :invalid="!!backendErrors.bank_account_number || $form.bank_account_number?.invalid"
                                @focusin="delete backendErrors.bank_account_number"
                                size="large"
                                autocomplete="off"
                                fluid
                            />
                        </FloatLabel>
                        <template v-if="$form.bank_account_number?.invalid">
                            <Message v-for="error of $form.bank_account_number.errors" :key="error" severity="error"
                                size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.bank_account_number">
                            <Message v-for="errorMessage of backendErrors?.bank_account_number" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>

                <div class="flex flex-col gap-1">
                    <FloatLabel variant="in">
                        <label for="entity.notes" class="first-letter:uppercase">{{ t('entity.attributes.notes') }}</label>
                        <Textarea
                            id="entity.notes" 
                            name="notes" 
                            type="text"
                            :invalid="!!backendErrors.notes || $form.notes?.invalid"
                            @focusin="delete backendErrors.notes" 
                            size="large" 
                            autocomplete="off" 
                            style="resize: none"
                            rows="7" 
                            fluid 
                        />
                    </FloatLabel>
                    <template v-if="$form.notes?.invalid">
                        <Message v-for="error of $form.notes.errors" :key="error" severity="error" size="small"
                            variant="simple">{{ error.message }}</Message>
                    </template>
                    <template v-if="backendErrors?.notes">
                        <Message v-for="errorMessage of backendErrors?.notes" :key="errorMessage" severity="error"
                            size="small" variant="simple">{{ errorMessage }}</Message>
                    </template>
                </div>

                <div class="flex flex-row gap-4">
                    <div class="flex flex-col gap-1">
                        <label for="entity.tax_exempt" class="first-letter:uppercase">{{
                            t('entity.attributes.tax_exempt') }}</label>
                        <ToggleSwitch input-id="entity.tax_exempt" name="tax_exempt"
                            :invalid="!!backendErrors.tax_exempt || $form.tax_exempt?.invalid"
                            @focus="delete backendErrors.tax_exempt" />
                        <template v-if="$form.tax_exempt?.invalid">
                            <Message v-for="error of $form.tax_exempt.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.active">
                            <Message v-for="errorMessage of backendErrors?.active" :key="errorMessage" severity="error"
                                size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                    <div class="flex flex-col gap-1">
                        <label for="entity.active" class="first-letter:uppercase">{{
                            t('entity.attributes.active') }}</label>
                        <ToggleSwitch input-id="entity.active" name="active"
                            :invalid="!!backendErrors.active || $form.active?.invalid"
                            @focus="delete backendErrors.active" />
                        <template v-if="$form.active?.invalid">
                            <Message v-for="error of $form.active.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.active">
                            <Message v-for="errorMessage of backendErrors?.active" :key="errorMessage" severity="error"
                                size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>
            </div>

            <Button type="submit" :loading="submitting"
                :icon="$form.valid && !hasAdditionalErrors ? 'pi pi-check' : null" :label="t('entity.save')"
                :title="!props.id ? t('entity.store.title') : t('entity.update.title')"
                :disabled="!$form.valid || hasAdditionalErrors || submitting" />
            <Button :label="t('common.buttons.cancel', 'Cancelar')" icon="pi pi-times" class="p-button-secondary ml-2"
                @click="cancel" :disabled="submitting" />
        </Form>
    </div>
</template>
