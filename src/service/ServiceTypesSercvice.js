import { ApiService } from './ApiService';

const resource = 'service_types';

export const ServiceTypesService = {
    list: async () => {
        return await ApiService.get(`/${resource}`);
    },
    show: async (id) => {
        return await ApiService.get(`/${resource}/${id}`);
    },
};