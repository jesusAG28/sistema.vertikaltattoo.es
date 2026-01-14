import z from "zod";

export const initialSubscriptionState = {
    id: 0,
    name: '',
    service_type_id: null,
    billing_cycle_id: null,
    price: 0,
    active: true
};

//Generar otro filtro para search

export const getSubscriptionSchema = (t) => {
    return z.object({
        name: z
            .string()
            .nonempty({ message: t('validation.required', { attribute: t('subscription.attributes.name') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('subscription.attributes.name') }) }),
        service_type_id: z
            .number({ message: t('validation.required', { attribute: t('subscription.attributes.service_type') }) })
            .positive({ message: t('validation.gt.numeric', { attribute: t('subscription.attributes.service_type'), value: 0 }) }),
        billing_cycle_id: z
            .number({ message: t('validation.required', { attribute: t('subscription.attributes.billing_cycle') }) })
            .positive({ message: t('validation.gt.numeric', { attribute: t('subscription.attributes.billing_cycle'), value: 0 }) }),
        price: z
            .number({ message: t('validation.required', { attribute: t('subscription.attributes.price') }) })
            .nonnegative({ message: t('validation.min.numeric', { attribute: t('subscription.attributes.price'), min: 0 }) }),
        active: z
            .boolean({ message: t('validation.boolean', { attribute: t('subscription.attributes.active')}) })
            .optional(),
    });
};

export function createSubscriptionFromApi(apiData) {
    if (!apiData) return { ...initialSubscriptionState };

    return {
        id: apiData?.id ?? 0,
        service_type_id: apiData?.service_type_id ?? null,
        billing_cycle_id: apiData?.billing_cycle_id ?? null,
        name: apiData?.name ?? '',
        price: parseFloat(apiData?.price) || 0,
        active: apiData?.active ?? true
    };
}
