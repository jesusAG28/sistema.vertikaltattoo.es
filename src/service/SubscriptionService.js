import { ApiService } from './ApiService';

const activeOptions = [
    { id: null, name: 'subscription.active.options.all' },
    { id: true, name: 'subscription.active.options.active' },
    { id: false, name: 'subscription.active.options.inactive' }
];

const resource = 'subscriptions';

export const SubscriptionService = {
    list: async () => {
        return await ApiService.get(`/${resource}`);
    },
    search: async (params = []) => {
        return await ApiService.post(`/${resource}/search`, params);
    },
    show: async (id) => {
        return await ApiService.get(`/${resource}/${id}`);
    },
    store: async (new_subscription) => {
        return await ApiService.post(`/${resource}`, new_subscription);
    },
    update: async (id, edit_subscription) => {
        return await ApiService.patch(`/${resource}/${id}`, edit_subscription);
    },
    delete: async (id) => {
        return await ApiService.delete(`/${resource}/${id}`);
    },
    options: {
        active: activeOptions
    },
    getInitialFilterValues: () => {
        return {
            name: null,
            service_type: null,
            billing_cycle: null,
            price: null,
            active: activeOptions[0]
        };
    }
};
