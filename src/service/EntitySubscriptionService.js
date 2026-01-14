import { ApiService } from './ApiService';

const resource = 'entity_subscriptions';

const date = new Date();
const year_now = date.getFullYear();

const month_now = date.getMonth() + 1;

export const EntitySubscriptionService = {
    list: async () => {
        return await ApiService.get(`/${resource}`);
    },
    search: async (params = []) => {
        return await ApiService.post(`/${resource}/search`, params);
    },
    show: async (id) => {
        return await ApiService.get(`/${resource}/${id}`);
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
            entity_id: null,
            subscription_id: null,
            month_active: month_now,
            year_active: year_now
        };
    }
};
