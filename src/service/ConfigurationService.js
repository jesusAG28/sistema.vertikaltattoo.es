import { ApiService } from './ApiService';

const resource = 'configuration';

export const ConfigurationService = {
    index: async () => {
        return await ApiService.get(`/${resource}`);
    },
    checkIssuer: async () => {
        return await ApiService.get(`/${resource}/check_issuer`);
    },
    store: async (payload) => {
        return await ApiService.post(`/${resource}`, payload);
    },
    update: async (payload) => {
        return await ApiService.put(`/${resource}`, payload);
    },
    delete: async (id) => {
        return await ApiService.delete(`/${resource}/${id}`);
    }
};
