import { ApiService } from "./ApiService";

const resource = 'laf_statuses';

export const LAFStatusService = {
    list: async () => {
        return await ApiService.get(`/${resource}`);
    },
    show: async (id) => {
        return await ApiService.get(`/${resource}/${id}`);
    }
}