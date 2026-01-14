import { ApiService } from './ApiService';

const resource = 'invoices';

export const InvoiceService = {
    list: async () => {
        return await ApiService.get(`/${resource}`);
    },
    search: async (params = []) => {
        return await ApiService.post(`/${resource}/search`, params);
    },
    show: async (id) => {
        return await ApiService.get(`/${resource}/${id}`);
    },
    officialize: async (id, payload) => {
        return await ApiService.put(`/${resource}/${id}/officialize`, payload);
    },
    rectificative: async (id, payload) => {
        return await ApiService.put(`/${resource}/${id}/rectificative`, payload);
    },
    print: async (id) => {
        return await ApiService.get(`${resource}/${id}/print`);
    },
    send: async (id) => {
        return await ApiService.get(`${resource}/${id}/send`);
    },
    store: async (payload) => {
        return await ApiService.post(`/${resource}`, payload);
    },
    update: async (id, payload) => {
        return await ApiService.put(`/${resource}/${id}`, payload);
    },
    delete: async (id) => {
        return await ApiService.delete(`/${resource}/${id}`);
    },
    getInitialFilterValues: () => {
        return {
            laf_status_id: null,
            entity_id: null,
            date_start: null,
            date_end: null,
            serie_id: null,
            number: null
        };
    },
    downloadSuppliesTemplate: async () => {
        return await ApiService.get(`/${resource}/downloadSuppliesTemplate`);
    },
    uploadSuppliesTemplate: async (formData) => {
        return await ApiService.post(`/${resource}/uploadSuppliesTemplate`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};
