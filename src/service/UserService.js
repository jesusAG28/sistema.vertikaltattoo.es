import { ApiService } from './ApiService';

const activeOptions = [
    { id: null, name: 'user.active.options.all' },
    { id: true, name: 'user.active.options.active' },
    { id: false, name: 'user.active.options.inactive' }
];

const resource = 'users';

export const UserService = {
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
    },
    options: {
        active: activeOptions
    },
    getInitialFilterValues: () => {
        return {
            user: null,
            name: null,
            email: null,
            roles: null,
            active: activeOptions[0]
        };
    }
};
