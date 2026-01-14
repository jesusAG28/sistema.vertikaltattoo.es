import { ApiService } from './ApiService';

const resource = 'payment_methods';

export const PaymentMethodsService = {
    list: async () => {
        return await ApiService.get(`/${resource}`);
    },
    // search: async (params = []) => {
    //     return await ApiService.post(`/${resource}/search`, params);
    // },
    show: async (id) => {
        return await ApiService.get(`/${resource}/${id}`);
    },
    // store: async (payload) => {
    //     return await ApiService.post(`/${resource}`, payload);
    // },
    // update: async (id, payload) => {
    //     return await ApiService.patch(`/${resource}/${id}`, payload);
    // },
    // delete: async (id) => {
    //     return await ApiService.delete(`/${resource}/${id}`);
    // }
};