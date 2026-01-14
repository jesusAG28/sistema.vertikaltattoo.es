import { ApiService } from './ApiService';

const resource = 'tax_types';

export const TaxTypesService = {
    list: async () => {
        return await ApiService.get(`/${resource}`);
    },
    show: async (id) => {
        return await ApiService.get(`/${resource}/${id}`);
    }
};
