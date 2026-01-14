import { ApiService } from './ApiService';

const resource = 'roles';

export const RoleService = {
    list: async (queryString = null) => {
        return await ApiService.get(`/${resource}` + (queryString ? '?' + queryString : ''));
    },
    // search: async (params = []) => {
    //     return await ApiService.post(`/${resource}/search`, params);
    // },
    show: async (id, queryString = null) => {
        return await ApiService.get(`/${resource}/${id}` + (queryString ? '?' + queryString : ''));
    },
    store: async (payload) => {
        return await ApiService.post(`/${resource}`, payload);
    },
    update: async (id, payload) => {
        return await ApiService.patch(`/${resource}/${id}`, payload);
    },
    delete: async (id) => {
        return await ApiService.delete(`/${resource}/${id}`);
    }
};
