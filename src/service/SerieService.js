import { ApiService } from './ApiService';

const resource = 'series';

export const SerieService = {
    list: async () => {
        return await ApiService.get(`/${resource}`);
    },
    show: async (id) => {
        return await ApiService.get(`/${resource}/${id}`);
    }
};