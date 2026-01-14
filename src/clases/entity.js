import { z } from 'zod';

/**
 * Datos iniciales de marcas
 */
export const initialEntityState = {
    id: 0,
    name: '',
    crn: '',
    alias: '',
    address: '',
    population: '',
    province: '',
    postal_code: '',
    phone: '',
    emails: '',
    emails_sending_invoice: [],
    website: '',
    payment_method_id: null,
    payment_due_days: 0,
    tax_exempt: false,
    bank_account_number: '',
    notes: '',
    active: true
};

export function createEntityFromApi(apiData) {
    if (!apiData) return { ...initialEntityState };

    return {
        id: apiData?.id ?? 0,
        name: apiData?.name ?? '',
        crn: apiData?.crn ?? '',
        alias: apiData?.alias ?? '',
        address: apiData?.address ?? '',
        population: apiData?.population ?? '',
        province: apiData?.province ?? '',
        postal_code: apiData?.postal_code ?? '',
        phone: apiData?.phone ?? '',
        emails: apiData?.emails ?? '',
        emails_sending_invoice: Array.isArray(apiData?.emails_sending_invoice) ? apiData?.emails_sending_invoice : [],
        website: apiData?.website ?? '',
        payment_method_id: apiData?.payment_method_id ?? null,
        payment_due_days: apiData?.payment_due_days ?? 0,
        tax_exempt: apiData?.tax_exempt ?? false,
        bank_account_number: apiData?.bank_account_number ?? '',
        notes: apiData?.notes ?? '',
        active: apiData?.active ?? true
    };
}

export const getEntitySchema = (t) => {
    return z.object({
        name: z
            .string()
            .nonempty({ message: t('validation.required', { attribute: t('entity.attributes.name') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('entity.attributes.name'), max: 255 }) }),
        crn: z
            .string()
            .nonempty({ message: t('validation.required', { attribute: t('entity.attributes.crn') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('entity.attributes.crn'), max: 255 }) }),
        alias: z
            .string({ message: t('validation.string', { attribute: t('entity.attributes.alias') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('entity.attributes.alias'), max: 255 }) })
            .nullable()
            .optional(),
        address: z
            .string({ message: t('validation.string', { attribute: t('entity.attributes.address') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('entity.attributes.address'), max: 255 }) })
            .nullable()
            .optional(),
        population: z
            .string({ message: t('validation.string', { attribute: t('entity.attributes.population') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('entity.attributes.population'), max: 255 }) })
            .nullable()
            .optional(),
        province: z
            .string({ message: t('validation.string', { attribute: t('entity.attributes.province') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('entity.attributes.province'), max: 255 }) })
            .nullable()
            .optional(),
        postal_code: z
            .string({ message: t('validation.string', { attribute: t('entity.attributes.postal_code') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('entity.attributes.postal_code'), max: 255 }) })
            .regex(/^\d*/, { message: t('validation.numeric', { attribute: t('entity.attributes.postal_code') }) })
            .nullable()
            .optional(),
        phone: z
            .string({ message: t('validation.string', { attribute: t('entity.attributes.phone') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('entity.attributes.phone'), max: 255 }) })
            .nullable()
            .optional(),
        emails: z
            .string()
            .nonempty({ message: t('validation.required', { attribute: t('entity.attributes.emails') }) })
            .email({ message: t('validation.email', { attribute: t('entity.attributes.emails') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('entity.attributes.emails'), max: 255 }) }),
        emails_sending_invoice: z
            .string()
            .trim()
            .nonempty({ message: t('validation.required', { attribute: t('entity.attributes.emails_sending_invoice') }) })
            // Lo transforma en un array
            .transform((val) => val.split(',').map(v => v.trim()))
            // La expresion regular es la misma que utiliza zod para validar los emails
            // Valida que todos son emails
            .refine((val) => val.every(email => /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9-]*\.)+[a-z]{2,}$/.test(email.toLowerCase())), {
                message: t('validation.regex', { attribute: t('entity.attributes.emails_sending_invoice') }),
            })
            // Verifica que no haya duplicados
            .refine((val) =>  val.length === new Set(val).size, {message: t('validation.distinct', { attribute: t('entity.attributes.emails_sending_invoice') }) }),
        website: z
            .string({ message: t('validation.string', { attribute: t('entity.attributes.website') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('entity.attributes.website'), max: 255 }) })
            .nullable()
            .optional(),
        payment_method_id: z
            .number()
            .positive({ message: t('validation.gt.numeric', { attribute: t('entity.attributes.payment_method'), value: 0 }) })
            .nullable()
            .optional(),
        payment_due_days: z
            .number()
            .nonnegative({ message: t('validation.min.numeric', { attribute: t('entity.attributes.payment_due_days'), min: 0 }) })
            .nullable()
            .optional(),
        tax_exempt: z.boolean(),
        bank_account_number: z
            .string({ message: t('validation.string', { attribute: t('entity.attributes.bank_account_number') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('entity.attributes.bank_account_number'), max: 255 }) })
            .nullable()
            .optional(),
        notes: z
            .string({ message: t('validation.string', { attribute: t('invoice.attributes.notes') }) })
            .nullable()
            .optional(),
        active: z.boolean()
    });
};
