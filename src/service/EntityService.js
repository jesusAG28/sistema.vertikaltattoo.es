import { ApiService } from './ApiService';

const activeOptions = [
    { id: null, name: 'entity.active.options.all' },
    { id: true, name: 'entity.active.options.active' },
    { id: false, name: 'entity.active.options.inactive' }
];

const resource = 'entities';

export const EntityService = {
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
    importCSV : async (payload) => {
        return await ApiService.post(`/${resource}/uploadCSV`, payload);
    },
    options: {
        active: activeOptions
    },
    getInitialFilterValues: () => {
        return {
            name: null,
            alias: null,
            phone: null,
            crn: null,
            billing_cycle: null,
            active: activeOptions[0]
        };
    }
};
