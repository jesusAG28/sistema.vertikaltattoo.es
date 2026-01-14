import { DateService } from '@/service/DateService';
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

export const invoiceTypeRectificative = [
    { id: 0, name: 'invoice.type_rectify.complete' },
    { id: 1, name: 'invoice.type_rectify.partial' }
];

/**
 * Datos iniciales de una factura
 */
export const initialInvoiceState = {
    id: 0,
    full_number: '',
    total_price: 0,
    total_amount: 0,
    laf_status_id: null,
    entity_id: null,
    serie_id: null,
    number: 0,
    date: null,
    payment_methods_id: null,
    entity_name: '',
    entity_crn: '',
    entity_address: '',
    entity_population: '',
    entity_province: '',
    entity_postal_code: '',
    issuer_name: '',
    issuer_crn: '',
    issuer_address: '',
    issuer_population: '',
    issuer_province: '',
    issuer_postal_code: '',
    notes: '',
    sended_at: null,
    paid_at: null,
    rectificated_invoice_id: 0
};

/**
 * Datos iniciales de una factura con las relaciones
 */
export const initialInvoiceMoreInfoState = {
    ...initialInvoiceState,
    full_number: '',
    total_price_amount: 0,
    total_amount: 0,
    total_tax_amount: 0,
    entity: null,
    laf_status: null,
    payment_method: null,
    serie: null,
    invoice_items: []
};

export const getInvoiceSchema = (t) => {
    // Se puede añadir lògica por si el formulario es update y tiene otro validador
    // mode = 'create'

    return z.object({
        entity_id: z.number().positive({ message: t('validation.required', { attribute: t('invoice.attributes.entity_id') }) }),
        entity_name: z
            .string({ message: t('validation.string', { attribute: t('invoice.attributes.entity_name') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('invoice.attributes.entity_name') }) })
            .nullable()
            .optional(),
        entity_crn: z
            .string({ message: t('validation.string', { attribute: t('invoice.attributes.entity_crn') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('invoice.attributes.entity_crn') }) })
            .nullable()
            .optional(),
        entity_address: z
            .string({ message: t('validation.string', { attribute: t('invoice.attributes.entity_address') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('invoice.attributes.entity_address') }) })
            .nullable()
            .optional(),
        entity_population: z
            .string({ message: t('validation.string', { attribute: t('invoice.attributes.entity_population') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('invoice.attributes.entity_population') }) })
            .nullable()
            .optional(),
        entity_province: z
            .string({ message: t('validation.string', { attribute: t('invoice.attributes.entity_province') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('invoice.attributes.entity_province') }) })
            .nullable()
            .optional(),
        entity_postal_code: z
            .string({ message: t('validation.string', { attribute: t('invoice.attributes.entity_postal_code') }) })
            .max(255, { message: t('validation.max.string', { attribute: t('invoice.attributes.entity_postal_code') }) })
            .regex(/^\d*/, { message: t('validation.numeric', { attribute: t('invoice.attributes.entity_postal_code') }) })
            .nullable()
            .optional(),
        notes: z
            .string({ message: t('validation.string', { attribute: t('invoice.attributes.notes') }) })
            .nullable()
            .optional(),
        date: z.preprocess((val) => val || null, z.date().nullable().optional()).transform((date) => (date ? DateService.date.toPayloadFormat(date) : null)),
        payment_methods_id: z
            .number()
            .positive({ message: t('validation.required', { attribute: t('invoice.attributes.number') }) })
            .nullable()
            .optional(),
        sended_at: z.preprocess((val) => val || null, z.date().nullable().optional()).transform((date) => (date ? DateService.date.toPayloadFormat(date) : null)),
        paid_at: z.preprocess((val) => val || null, z.date().nullable().optional()).transform((date) => (date ? DateService.date.toPayloadFormat(date) : null))
    });
};

export const getInvoiceRectificative = (t) => {
    return z.object({
        type: z.coerce.boolean(),
        items_invoices_ids: z.array(z.number()).optional()
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

/**
 * Funcion para preparar el objeto , para devolver o enviar a la api
 * @param {*} apiData
 * @returns
 */
export function createInvoiceFromApi(apiData) {
    if (!apiData) return { ...initialInvoiceState };

    //Lo declaro en una variable sino salta un error silencioso
    let invoice = {
        id: apiData?.id ?? 0,
        laf_status_id: apiData?.laf_status_id ?? null,
        entity_id: apiData?.entity_id ?? null,
        serie_id: apiData?.serie_id ?? null,
        number: apiData?.number ?? 0,
        date: apiData?.date ? new Date(apiData.date) : null,
        payment_methods_id: apiData?.payment_methods_id ?? null,
        entity_name: apiData?.entity_name ?? '',
        entity_crn: apiData?.entity_crn ?? '',
        entity_address: apiData?.entity_address ?? '',
        entity_population: apiData?.entity_population ?? '',
        entity_province: apiData?.entity_province ?? '',
        entity_postal_code: apiData?.entity_postal_code ?? '',
        issuer_name: apiData?.issuer_name ?? '',
        issuer_crn: apiData?.issuer_crn ?? '',
        issuer_address: apiData?.issuer_address ?? '',
        issuer_population: apiData?.issuer_population ?? '',
        issuer_province: apiData?.issuer_province ?? '',
        issuer_postal_code: apiData?.issuer_postal_code ?? '',
        notes: apiData?.notes ?? '',
        sended_at: apiData?.sended_at ? new Date(apiData.sended_at) : null,
        paid_at: apiData?.paid_at ? new Date(apiData?.paid_at) : null,
        rectificated_invoice_id: apiData?.rectificated_invoice_id ?? 0,
        full_number: apiData?.full_number ?? '',
        total_price: apiData?.total_price ?? 0,
        total_amount: apiData?.total_amount ?? 0,
        total_tax_amount: apiData?.total_tax_amount ?? 0
    };

    return invoice;
}

/**
 * Funcion para preparar el objeto con las relaciones , para devolver o enviar a la API
 * @param {*} apiData
 * @returns
 */
export function createInvoiceMoreInfoApi(apiData) {
    if (!apiData) return { ...initialInvoiceMoreInfoState };

    return {
        ...createInvoiceFromApi(apiData),
        full_number: apiData?.full_number ?? '',
        total_price: apiData?.total_price ?? 0,
        total_amount: apiData?.total_amount ?? 0,
        total_tax_amount: apiData?.total_tax_amount ?? 0,
        entity: apiData?.entity ?? null,
        laf_status: apiData?.laf_status ?? null,
        payment_method: apiData?.payment_method ?? null,
        serie: apiData?.serie ?? null,
        invoice_items: apiData?.invoice_items ?? []
    };
}
