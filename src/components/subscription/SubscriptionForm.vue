<script setup>
import { onBeforeMount, ref, computed } from 'vue';
import { SubscriptionService } from '@/service/SubscriptionService';
import { useToast } from 'primevue/usetoast';
import AppProgressSpinner from '@/layout/AppProgressSpinner.vue';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import { useSelectData } from '@/composables/useSelectData';
import { BillingCyclesService } from '@/service/BillingCyclesService';
import { createSubscriptionFromApi, getSubscriptionSchema, initialSubscriptionState } from '@/clases/subscription';
import { ServiceTypesService } from '@/service/ServiceTypesSercvice';

const toast = useToast();
const { t } = useI18n();

const props = defineProps({
    id: {
        type: String,
        default: null
    }
});

const subscription = ref({... initialSubscriptionState});
const resolver = ref(zodResolver(getSubscriptionSchema(t)));
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
        const response = await (!props.id ? SubscriptionService.store(values) : SubscriptionService.update(props.id, values));

        if (response.data) {
            toast.add({
                severity: 'success',
                summary: !props.id ? t('subscription.store.success') : t('subscription.update.success', { id: props.id }),
                life: 3000
            });

            setTimeout(() => {
                router.push('/subscriptions');
            }, 3000);
            
        }
    } catch (AxiosError) {
        if (AxiosError.response?.status === 422 && AxiosError.response?.data?.errors) {
            backendErrors.value = AxiosError.response.data.errors;
            submitting.value = false;
            return;
        }

        const error = {
            summary: !props.id ? t('subscription.store.error') : t('subscription.update.error', { id: props.id })
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

    fetchServiceTypes();
    fetchBillingCycles();

    if (props.id) {
        await fetchSubscription();
    }

    loading.value = false;
});

const loadingSubscription = ref(false);
const fetchSubscription = async () => {
    loadingSubscription.value = true;

    try {
        const response = await SubscriptionService.show(props.id);

        /**
         * Se pone los ids de service_type_id y billing_cycle_id
         * para que el select los asigne automaticamente, ya que si son objetos no los hace
         */
        if (response.data?.subscription) {
            let sub = createSubscriptionFromApi(response.data.subscription);
            sub.billing_cycle_id = sub.billing_cycle_id?.id ?? sub.billing_cycle_id;
            sub.service_type_id = sub.service_type_id?.id ?? sub.service_type_id;
            subscription.value = sub;
        }
    } catch (AxiosError) {
        const error = {
            summary: t('subscription.error', { id: props.id })
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

    loadingSubscription.value = false;
};

const { items: service_types, loading: loadingServiceTypes, fetchData: fetchServiceTypes} = useSelectData(
    ServiceTypesService.list, 
    {
        toast, 
        i18n: { t },
        errorMsgKey: 'subscription.service_types.error',
        dataValue: 'service_types'
    }
);

const { items: billing_cycles, loading: loadingBillingCycles, fetchData: fetchBillingCycles} = useSelectData(
    BillingCyclesService.list, 
    {
        toast, 
        i18n: { t },
        errorMsgKey: 'subscription.billing_cycles.error',
        dataValue: 'billing_cycles'
    }
);


const cancel = () => {    
    router.replace('/subscriptions');
}
</script>

<template>
    <div v-if="loading" class="flex items-center w-full h-full">
        <AppProgressSpinner />
    </div>
    <div v-else class="card">
        <Form v-slot="$form" :initial-values="subscription" :resolver="resolver" @submit="submit" class="space-y-4">
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
                    <div class="flex flex-col basis-[40%] gap-1">
                        <label for="subscription.name" class="first-letter:uppercase">{{ t('subscription.attributes.name') }}</label>
                        <InputText id="subscription.name" name="name" type="text" :invalid="!!backendErrors.name || $form.name?.invalid" @focusin="delete backendErrors.name" autocomplete="off" />
                        <template v-if="$form.name?.invalid">
                            <Message v-for="error of $form.name.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.name">
                            <Message v-for="errorMessage of backendErrors?.name" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col basis-[20%] gap-1">
                        <label for="subscription.service_type_id" class="first-letter:uppercase">{{ t('subscription.attributes.service_type') }}</label>
                        <Select
                            id="subscription.service_type_id"
                            name="service_type_id"
                            :options="service_types"
                            option-value="id"
                            option-label="name"
                            :placeholder="loadingServiceTypes ? t('subscription.service_types.placeholder.loading') : t('subscription.service_types.placeholder.single')"
                            :loading="loadingServiceTypes"
                            :invalid="!!backendErrors.service_type_id || $form.service_type_id?.invalid"
                            @focus="delete backendErrors.service_type_id"
                        />
                        <template v-if="$form.service_type_id?.invalid">
                            <Message v-for="error of $form.service_type_id.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.service_type_id">
                            <Message v-for="errorMessage of backendErrors?.service_type_id" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col basis-[15%] gap-1">
                        <label for="subscription.billing_cycle_id" class="first-letter:uppercase">{{ t('subscription.attributes.billing_cycle') }}</label>
                        <Select
                            id="subscription.billing_cycle_id"
                            name="billing_cycle_id"
                            :options="billing_cycles"
                            option-value="id"
                            option-label="name"
                            :placeholder="loadingBillingCycles ? t('subscription.billing_cycles.placeholder.loading') : t('subscription.billing_cycles.placeholder.single')"
                            :loading="loadingBillingCycles"
                            :invalid="!!backendErrors.billing_cycle_id || $form.billing_cycle_id?.invalid"
                            @focus="delete backendErrors.billing_cycle_id"
                            
                        />
                        <template v-if="$form.billing_cycle_id?.invalid">
                            <Message v-for="error of $form.billing_cycle_id.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.billing_cycle_id">
                            <Message v-for="errorMessage of backendErrors?.billing_cycle_id" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col basis-[15%] gap-1">
                        <label for="subscription.price" class="first-letter:uppercase">{{ t('subscription.attributes.price') }}</label>
                        <InputGroup>
                            <InputNumber 
                                id="subscription.price" 
                                name="price" 
                                :invalid="!!backendErrors.price || $form.price?.invalid" 
                                @focusin="delete backendErrors.price"
                                :min-fraction-digits="0"
                                :max-fraction-digits="2"
                                :min="0"
                                autocomplete="off" 
                            />                        
                            <InputGroupAddon>€</InputGroupAddon>
                        </InputGroup>
                        <template v-if="$form.price?.invalid">
                            <Message v-for="error of $form.price.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.price">
                            <Message v-for="errorMessage of backendErrors?.price" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>

                    <div class="flex flex-col mx-3 gap-1">
                        <label for="subscription.active" class="first-letter:uppercase">{{ t('subscription.attributes.active') }}</label>
                        <ToggleSwitch input-id="subscription.active" name="active" :invalid="!!backendErrors.active || $form.active?.invalid" @focus="delete backendErrors.active" />
                        <template v-if="$form.active?.invalid">
                            <Message v-for="error of $form.active.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                        <template v-if="backendErrors?.active">
                            <Message v-for="errorMessage of backendErrors?.active" :key="errorMessage" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
                        </template>
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                :loading="submitting"
                :icon="$form.valid && !hasAdditionalErrors ? 'pi pi-check' : null"
                :label="t('subscription.save')"
                :title="!props.id ? t('subscription.store.title') : t('subscription.update.title')"
                :disabled="!$form.valid || hasAdditionalErrors || submitting"
            />
            <Button :label="t('common.buttons.cancel', 'Cancelar')" icon="pi pi-times" class="p-button-secondary ml-2" @click="cancel" :disabled="submitting" />
        </Form>
    </div>
</template>
