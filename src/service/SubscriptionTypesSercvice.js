import { ApiService } from './ApiService';

const resource = 'subscription_types';

export const SubscriptionTypesService = {
    list: async () => {
        return await ApiService.get(`/${resource}`);
    },
    show: async (id) => {
        return await ApiService.get(`/${resource}/${id}`);
    },
};