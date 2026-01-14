import { ApiService } from './ApiService';

const resource = 'invoice_items';

export const InvoiceItemService = {
    list: async () => {
        return await ApiService.get(`/${resource}`);
    },
    search: async (params = []) => {
        return await ApiService.post(`/${resource}/search`, params);
    },
    show: async (id, queryString = null) => {
        return await ApiService.get(`/${resource}/${id}` + (queryString ? '?' + queryString : ''));
    },
    store: async (payload) => {
        return await ApiService.post(`/${resource}`, payload);
    },
    update: async (id, payload) => {
        return await ApiService.put(`/${resource}/${id}`, payload);
    },
    delete: async (id) => {
        return await ApiService.delete(`/${resource}/${id}`);
    }
};
