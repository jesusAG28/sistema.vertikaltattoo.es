import { DateService } from '@/service/DateService';
import { z } from 'zod';


export const initialEntitySubscriptionState = {
    id: 0,
    entity_id: null,
    subscription_id: null,
    discount_percentage: 0,
    surcharge_percentage: 0,
    tax_type: null,
    starts_at: null,
    ends_at: null,
    apply_associated_discount: 0
};

export function createEntitySubscriptionFromApi(apiData) {
    if (!apiData) return { ...initialEntitySubscriptionState };

    return {
        id: apiData?.id ?? 0,
        entity_id: apiData?.entity_id ?? null,
        subscription_id: apiData?.subscription_id ?? null,
        discount_percentage: apiData?.discount_percentage ?? 0,
        surcharge_percentage: apiData?.surcharge_percentage ?? 0,
        tax_type_id: apiData?.tax_type_id?.id ?? 0,
        starts_at: apiData?.starts_at ? new Date(apiData.starts_at) : null,
        ends_at: apiData?.ends_at ? new Date(apiData.ends_at) : null,
        apply_associated_discount: apiData?.apply_associated_discount ?? 0
    };
}

export const getEntitySubscriptionSchema = (t) => {
    return z
        .object({
            entity_id: z
                .number({ message: t('validation.required', { attribute: t('entity_subscription.attributes.entity') }) })
                .positive(),
            subscription_id: z
                .number({ message: t('validation.required', { attribute: t('entity_subscription.attributes.subscription') }) })
                .positive(),
            starts_at: z
                .preprocess((val) => (val ? new Date(val) : null), z.date({ message: t('validation.required', { attribute: t('entity_subscription.attributes.starts_at') }) }))
                .transform((date) => (date ? DateService.date.toPayloadFormat(date) : null)),
            ends_at: z
                .preprocess((val) => (val ? new Date(val) : null), z.date({ message: t('validation.required', { attribute: t('entity_subscription.attributes.ends_at') }) }).nullable())
                .transform((date) => (date ? DateService.date.toPayloadFormat(date) : null)),
            discount_percentage: z.preprocess(
                (value) => parseInt(value),
                z
                    .number()
                    .nonnegative({ message: t('validation.required', { attribute: t('entity_subscription.attributes.discount_percentage') }) })
                    .lte(100, { message: t('validation.max.numeric', { attribute: t('entity_subscription.attributes.discount_percentage'), max: 100 }) })
                    .nullable()
            ),
            surcharge_percentage: z.preprocess(
                (value) => parseInt(value),
                z
                    .number({ message: t('validation.required', { attribute: t('entity_subscription.attributes.surcharge_percentage') }) })
                    .nonnegative({ message: t('validation.min.numeric', { attribute: t('entity_subscription.attributes.surcharge_percentage'), min: 0 }) })
                    .nullable()
            ),
            tax_type_id: z.number().positive({ message: t('validation.required', { attribute: t('entity_subscription.attributes.tax_type_id') }) }),
            apply_associated_discount: z.preprocess(
                (value) => parseInt(value),
                z
                    .number({ message: t('validation.required', { attribute: t('invoice_item.attributes.apply_associated_discount') }) })
                    .nonnegative({ message: t('validation.min.numeric', { attribute: t('invoice_item.attributes.apply_associated_discount'), min: 0 }) })
                    .nullable()
            ),
        })
        .refine(
            (data) => {
                if (data.starts_at && data.ends_at) {
                    return new Date(data.ends_at) >= new Date(data.starts_at);
                }
                return true;
            },
            {
                message: t('validation.after_or_equal', {
                    attribute: t('entity_subscription.attributes.ends_at'),
                    date: t('entity_subscription.attributes.starts_at')
                }),
                path: ['ends_at']
            }
        );
};
