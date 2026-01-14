import z from 'zod';

export const initialInvoiceItemState = {
    id: 0,
    invoice_id: null,
    entity_subscription_id: null,
    service_type_id: 0,
    service_type: null,
    description: '',
    price: 0,
    discount_percentage: 0,
    surcharge_percentage: 0,
    tax_type_id: 0,
    tax_type: null,
    total: 0,
    rectificated_at: null
};

export const getInvoiceItemSchema = (t) => {
    return z.object({
        service_type_id: z.number().positive({ message: t('validation.required', { attribute: t('invoice_item.attributes.service_type_id') }) }),
        description: z.string({ message: t('validation.required', { attribute: t('invoice_item.attributes.description') }) }).nullable(),
        price: z.preprocess(
            (value) => (value || value == 0 ? parseFloat(value) : null),
            z
                .number({
                    required_error: t('validation.required', { attribute: t('invoice_item.attributes.price') }),
                    invalid_type_error: t('validation.numeric', { attribute: t('invoice_item.attributes.price') })
                })
                .nonnegative({ message: t('validation.min.numeric', { attribute: t('invoice_item.attributes.price'), min: 0 }) })
        ),
        discount_percentage: z.preprocess(
            (value) => parseInt(value),
            z
                .number()
                .nonnegative({ message: t('validation.required', { attribute: t('invoice_item.attributes.discount_percentage') }) })
                .lte(100, { message: t('validation.max.numeric', { attribute: t('invoice_item.attributes.discount_percentage'), max: 100 }) })
                .nullable()
        ),
        surcharge_percentage: z.preprocess(
            (value) => parseInt(value),
            z
                .number({ message: t('validation.required', { attribute: t('invoice_item.attributes.price') }) })
                .nonnegative({ message: t('validation.min.numeric', { attribute: t('invoice_item.attributes.price'), min: 0 }) })
                .nullable()
        ),
        tax_type_id: z.number().positive({ message: t('validation.required', { attribute: t('invoice_item.attributes.tax_type_id') }) })
    });
};

export function createInvoiceItemFromApi(apiData) {
    if (!apiData) return { ...initialInvoiceItemState };

    return {
        id: apiData?.id ?? 0,
        entity_subscription_id: apiData?.entity_subscription_id ?? null,
        service_type_id: apiData?.service_type_id?.id ?? null,
        service_type: apiData?.service_type_id ?? null,
        invoice_id: apiData?.invoice_id ?? null,
        description: apiData?.description ?? '',
        price: apiData?.price ?? 0,
        discount_percentage: apiData?.discount_percentage ?? 0,
        surcharge_percentage: apiData?.surcharge_percentage ?? 0,
        tax_type_id: apiData?.tax_type_id?.id ?? 0,
        tax_type: apiData?.tax_type_id ?? null,
        total: apiData?.total ?? 0,
        rectificated_at: apiData?.rectificated_at ? new Date(apiData?.rectificated_at) : null
    };
}

export const calculateTotal = (invoiceItem, taxs_types = []) => {
    invoiceItem = createInvoiceItemFromApi(invoiceItem);

    let val = parseFloat(invoiceItem?.price ?? 0);

    const discount_percentage = parseFloat(invoiceItem?.discount_percentage ?? 0);
    const surcharge_percentage = parseFloat(invoiceItem?.surcharge_percentage ?? 0);
    const tax_type_id = parseInt(invoiceItem?.tax_type ?? 0);

    let totalVale = val;

    if (discount_percentage > 0) {
        totalVale = totalVale * ((100 - discount_percentage) / 100);
    }

    if (surcharge_percentage > 0 && totalVale > 0) {
        totalVale += totalVale * (surcharge_percentage / 100);
    }

    if (tax_type_id > 0 && totalVale > 0) {
        const tax_type = (Array.from(taxs_types) ?? []).find((tax) => tax.id === tax_type_id);

        if (tax_type) {
            totalVale += totalVale * (tax_type.rate / 100);
        }
    }

    return parseFloat(totalVale.toFixed(2));
};

export const calculatePrice = (invoiceItem, taxs_types = []) => {
    invoiceItem = createInvoiceItemFromApi(invoiceItem);

    let val = parseFloat(invoiceItem?.total ?? 0);

    const discount_percentage = parseFloat(invoiceItem?.discount_percentage ?? 0);
    const surcharge_percentage = parseFloat(invoiceItem?.surcharge_percentage ?? 0);
    const tax_type_id = parseInt(invoiceItem?.tax_type ?? 0);

    let totalVale = val;

    if (tax_type_id > 0) {
        const tax_type = (taxs_types ?? []).find((tax) => tax.id === tax_type_id);

        if (tax_type && tax_type.rate >= 0) {
            totalVale = totalVale / (1 + tax_type.rate / 100);
        }
    }

    if (surcharge_percentage > 0) {
        totalVale = totalVale / (1 + surcharge_percentage / 100);
    }

    if (discount_percentage > 0) {
        totalVale = totalVale * (100 / (100 - discount_percentage));
    }

    return parseFloat(totalVale.toFixed(2));
};
