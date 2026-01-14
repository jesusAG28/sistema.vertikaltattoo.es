import { ApiService } from './ApiService';

const resource = 'unseen-tickets';

export const SupportService = {
    unseenTickets: async () => {
        return await ApiService.get(`/${resource}`);
    }
};
