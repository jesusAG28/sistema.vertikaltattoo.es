import { ref } from 'vue';
import { z } from 'zod';

const year = ref(0);

/**
 * Datos iniciales de series
 */
export const initialSerieState = {
    name: '',
    year: year.value,
    issuer_id: 0,
    invoice_type_id: 0,
    is_active: true,
    serie: ''
};

export const getInvoiceSerieSchema = (t) => {
    // Se puede añadir lògica por si el formulario es update y tiene otro validador
    // mode = 'create'

    return z.object({
        name: z
            .string()
            .nonempty({
                message: t('validation.required', {
                    attribute: t('invoiceserie.attributes.name')
                })
            })
            .max(255, {
                message: t('validation.max.string', {
                    attribute: t('invoiceserie.attributes.name')
                })
            }),
        year: z.number().positive({
            message: t('validation.required', {
                attribute: t('invoiceserie.attributes.year')
            })
        }),
        issuer_id: z.number().positive({
            message: t('validation.required', {
                attribute: t('invoiceserie.attributes.issuer_id')
            })
        }),
        invoice_type_id: z.number().nullable(),
        is_active: z.boolean(),
        serie: z
            .string()
            .nonempty({
                message: t('validation.required', {
                    attribute: t('invoiceserie.attributes.serie')
                })
            })
            .max(20, {
                message: t('validation.max.string', {
                    attribute: t('invoiceserie.attributes.serie')
                })
            })
    });
};

/**
 * Función para devolver los datos de la API
 * @param {*} apiData
 * @returns
 */
export function createInvoiceSerieFromApi(apiData) {
    if (!apiData) return { ...initialSerieState };

    return {
        name: apiData.name ?? '',
        year: apiData.year ?? '',
        issuer_id: apiData.issuer_id ?? 0,
        invoice_type_id: apiData.invoice_type_id ?? 0,
        is_active: apiData.is_active ?? true,
        serie: apiData.serie ?? ''
    };
}
