<script setup>
import { onBeforeMount, ref, computed } from 'vue';
import { EntityService } from '@/service/EntityService';
import { EntitySubscriptionService } from '@/service/EntitySubscriptionService';
import { SubscriptionService } from '@/service/SubscriptionService';
import { useToast } from 'primevue/usetoast';
import AppProgressSpinner from '@/layout/AppProgressSpinner.vue';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import { createEntitySubscriptionFromApi, getEntitySubscriptionSchema, initialEntitySubscriptionState } from '@/clases/entitySubscription';
import { createSubscriptionFromApi } from '@/clases/subscription';
import { createEntityFromApi } from '@/clases/entity';
import { useSelectData } from '@/composables/useSelectData';
import { TaxTypesService } from '@/service/TaxTypesService';

const toast = useToast();

const { t } = useI18n();

const props = defineProps({
    id: {
        type: String,
        default: null
    }
});

const entity_subscription = ref({ ...initialEntitySubscriptionState });

const resolver = ref(
    zodResolver(getEntitySubscriptionSchema(t))
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
        const response = await (!props.id
            ? EntitySubscriptionService.store(values)
            : EntitySubscriptionService.update(props.id, values)
        );

        if (response.data) {
            toast.add({
                severity: 'success',
                summary: !props.id ? t('entity_subscription.store.success') : t('entity_subscription.update.success', { id: props.id }),
                life: 3000
            });

            setTimeout(() => {
                router.push('/entities_subscriptions');
            }, 3000);

        }
    } catch (AxiosError) {
        if (AxiosError.response?.status === 422 && AxiosError.response?.data?.errors) {
            backendErrors.value = AxiosError.response.data.errors;
            submitting.value = false;
            return;
        }

        const error = {
            summary: !props.id ? t('entity_subscription.store.error') : t('entity_subscription.update.error', { id: props.id })
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

    fetchEntities();
    fetchSubscriptions();
    fetchTaxTypes();

    if (props.id) {
        await fetchEntitySubscription();
    }

    loading.value = false;
});

const loadingEntitySubscription = ref(false);
const fetchEntitySubscription = async () => {
    loadingEntitySubscription.value = true;

    try {
        const response = await EntitySubscriptionService.show(props.id);

        if (response.data?.entity_subscription) {
            let enty_sub = createEntitySubscriptionFromApi(response.data.entity_subscription);
            enty_sub.entity_id = enty_sub.entity_id?.id ?? enty_sub.entity_id;
            enty_sub.subscription_id = enty_sub.subscription_id?.id ?? enty_sub.subscription_id;
            entity_subscription.value = enty_sub;
        }
    } catch (AxiosError) {
        const error = {
            summary: t('entity_subscription.error', { id: props.id })
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

    loadingEntitySubscription.value = false;
};

const subscriptions = ref([]);
const loadingSubscriptions = ref(false);

const fetchSubscriptions = async () => {
    loadingSubscriptions.value = true

    try {
        const response = await SubscriptionService.search({ active: true });

        if (response.data?.subscriptions) {
            subscriptions.value = response.data.subscriptions.map(subscription => createSubscriptionFromApi(subscription));
        }
    } catch (AxiosError) {
        toast.add({
            severity: 'error',
            summary: t('entity_subscription.subscriptions.error'),
            detail: AxiosError.response?.data?.message,
            life: 3000
        });
    }

    loadingSubscriptions.value = false;
}

const entities = ref([]);
const loadingEntities = ref(false);
const fetchEntities = async () => {
    loadingEntities.value = true;

    try {
        const response = await EntityService.search({ active: true });

        if (response.data?.entities) {
            entities.value = response.data.entities.map(entity => createEntityFromApi(entity));
        }
    } catch (AxiosError) {
        toast.add({
            severity: 'error',
            summary: t('entity_subscription.entities.error'),
            detail: AxiosError.response?.data?.message,
            life: 3000
        });
    }

    loadingEntities.value = false;
}

const { items: taxs_types, loading: loadingTaxTypes, fetchData: fetchTaxTypes } = useSelectData(
    TaxTypesService.list,
    {
        toast,
        i18n: { t },
        errorMsgKey: 'entity_subscription.tax_types.error',
        dataValue: 'tax_types'
    }
);

const cancel = () => {
    router.replace('/entities_subscriptions');
}

</script>

<template>
    <div v-if="loading" class="flex items-center w-full h-full">
        <AppProgressSpinner />
    </div>
    <div v-else class="card">
        <Form v-slot="$form" :initial-values="entity_subscription" :resolver="resolver" @submit="submit"
            class="space-y-4">
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
                        <label for="entity_subscription.entity_id"
                            class="first-letter:uppercase">{{ t('entity_subscription.attributes.entity') }}</label>
                        <Select id="entity_subscription.entity_id" name="entity_id" :options="entities"
                            option-value="id" option-label="name" :filter="true"
                            :placeholder="loadingEntities ? t('entity_subscription.entities.placeholder.loading') : t('entity_subscription.entities.placeholder.single')"
                            :loading="loadingEntities" :invalid="!!backendErrors.entity_id || $form.entity_id?.invalid"
                            @focus="delete backendErrors.entity_id" />
                        <template v-if="$form.entity_id?.invalid">
                            <Message v-for="error of $form.entity_id.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.entity_id">
                            <Message v-for="errorMessage of backendErrors?.entity_id" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                    <div class="flex flex-col basis-[25%] gap-1">
                        <label for="entity_subscription.subscription_id"
                            class="first-letter:uppercase">{{ t('entity_subscription.attributes.subscription') }}</label>
                        <Select id="entity_subscription.subscription_id" name="subscription_id" :options="subscriptions"
                            option-value="id" option-label="name" :filter="true"
                            :placeholder="loadingSubscriptions ? t('entity_subscription.subscriptions.placeholder.loading') : t('entity_subscription.subscriptions.placeholder.single')"
                            :loading="loadingSubscriptions"
                            :invalid="!!backendErrors.subscription_id || $form.subscription_id?.invalid"
                            @focus="delete backendErrors.subscription_id" />
                        <template v-if="$form.subscription_id?.invalid">
                            <Message v-for="error of $form.subscription_id.errors" :key="error" severity="error"
                                size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.subscription_id">
                            <Message v-for="errorMessage of backendErrors?.subscription_id" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col basis-[15%] gap-1">
                        <label for="starts_at" class="first-letter:uppercase">{{
                            t('entity_subscription.attributes.starts_at') }}</label>
                        <DatePicker date-format="dd/mm/yy" :show-time="false" id="starts_at" name="starts_at"
                            :manualInput="false" :invalid="!!backendErrors.starts_at || $form.starts_at?.invalid"
                            @focusin="delete backendErrors.starts_at" autocomplete="off" show-icon />

                        <template v-if="$form.starts_at?.invalid">
                            <Message v-for="error of $form.starts_at.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.starts_at">
                            <Message v-for="errorMessage of backendErrors?.starts_at" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col basis-[15%] gap-1">
                        <label for="ends_at" class="first-letter:uppercase">{{
                            t('entity_subscription.attributes.ends_at') }}</label>
                        <DatePicker date-format="dd/mm/yy" :show-time="false" id="ends_at" name="ends_at"
                            :manualInput="false" :invalid="!!backendErrors.ends_at || $form.ends_at?.invalid"
                            @focusin="delete backendErrors.ends_at" autocomplete="off" show-icon />
                        <template v-if="$form.ends_at?.invalid">
                            <Message v-for="error of $form.ends_at.errors" :key="error" severity="error" size="small"
                                variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.ends_at">
                            <Message v-for="errorMessage of backendErrors?.ends_at" :key="errorMessage" severity="error"
                                size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>
                <div class="flex flex-row gap-4">
                    <div class="flex flex-col basis-[15%] gap-1">
                        <label for="entity_subscription.tax_type_id" class="first-letter:uppercase">{{ t('entity_subscription.attributes.tax_type_id') }}</label>
                        <Select id="entity_subscription.tax_type_id" name="tax_type_id" :options="taxs_types" 
                            option-value="id" option-label="name"
                            :placeholder="loadingTaxTypes ? t('entity_subscription.tax_types.placeholder.loading') : t('entity_subscription.tax_types.placeholder.single')"
                            :loading="loadingTaxTypes"
                            :invalid="!!(backendErrors.tax_type_id || $form.tax_type_id?.invalid)"
                            @focus="delete backendErrors.tax_type_id" class="w-full"/>

                        <template v-if="$form.tax_type_id?.invalid">
                            <Message v-for="error of $form.tax_type_id.errors" :key="error" severity="error"
                                size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.tax_type_id">
                            <Message v-for="errorMessage of backendErrors?.tax_type_id" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                    <div class="flex flex-col gap-1">
                        <label for="entity_subscription.discount_percentage" class="first-letter:uppercase">{{ t('entity_subscription.attributes.discount_percentage') }}</label>
                        <InputGroup>
                            <InputNumber id="entity_subscription.discount_percentage" name="discount_percentage"
                                :invalid="!!(backendErrors.discount_percentage || $form.discount_percentage?.invalid)"
                                @focusin="delete backendErrors.discount_percentage" :max-fraction-digits="0"
                                :min="0" :max="100" autocomplete="off" />
                            <InputGroupAddon>%</InputGroupAddon>
                        </InputGroup>
                        <template v-if="$form.discount_percentage?.invalid">
                            <Message v-for="error of $form.discount_percentage.errors" :key="error" severity="error"
                                size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.discount_percentage">
                            <Message v-for="errorMessage of backendErrors?.discount_percentage" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                    <div class="flex flex-col gap-1">
                        <label for="entity_subscription.surcharge_percentage" class="first-letter:uppercase">{{ t('entity_subscription.attributes.surcharge_percentage') }}</label>
                        <InputGroup>
                            <InputNumber id="entity_subscription.surcharge_percentage" name="surcharge_percentage"
                                :invalid="!!(backendErrors.surcharge_percentage || $form.surcharge_percentage?.invalid)"
                                @focusin="delete backendErrors.surcharge_percentage" :max-fraction-digits="0"
                                :min="0" autocomplete="off" />
                            <InputGroupAddon>%</InputGroupAddon>
                        </InputGroup>
                        <template v-if="$form.surcharge_percentage?.invalid">
                            <Message v-for="error of $form.surcharge_percentage.errors" :key="error" severity="error"
                                size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.surcharge_percentage">
                            <Message v-for="errorMessage of backendErrors?.surcharge_percentage" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                    <div class="flex flex-col gap-1">
                        <label for="entity_subscription.apply_associated_discount" class="first-letter:uppercase">{{ t('entity_subscription.attributes.apply_associated_discount') }}</label>
                        <InputGroup>
                            <InputGroupAddon>-</InputGroupAddon>
                            <InputNumber id="entity_subscription.apply_associated_discount" name="apply_associated_discount"
                                :invalid="!!(backendErrors.apply_associated_discount || $form.apply_associated_discount?.invalid)"
                                @focusin="delete backendErrors.apply_associated_discount" :max-fraction-digits="2" :min-fraction-digits="0"
                                :min="0" autocomplete="off" />
                            <InputGroupAddon>€</InputGroupAddon>
                        </InputGroup>
                        <template v-if="$form.apply_associated_discount?.invalid">
                            <Message v-for="error of $form.apply_associated_discount.errors" :key="error" severity="error"
                                size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.apply_associated_discount">
                            <Message v-for="errorMessage of backendErrors?.apply_associated_discount" :key="errorMessage"
                                severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>
            </div>
            <Button type="submit" :loading="submitting"
                :icon="$form.valid && !hasAdditionalErrors ? 'pi pi-check' : null" :label="t('entity.save')"
                :title="!props.id ? t('entity_subscription.store.title') : t('entity_subscription.update.title')"
                :disabled="!$form.valid || hasAdditionalErrors || submitting" />
            <Button :label="t('common.buttons.cancel', 'Cancelar')" icon="pi pi-times" class="p-button-secondary ml-2"
                @click="cancel" :disabled="submitting" />
        </Form>
    </div>
</template>
