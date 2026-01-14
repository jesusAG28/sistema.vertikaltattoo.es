import { ref } from 'vue';
import { defineStore } from 'pinia';
import { SupportService } from '@/service/SupportService';

export const useSupportStore = defineStore('support', () => {
    const unseenTickets = ref(0);
    const loading = ref(false);

    const fetchUnseenTickets = async () => {
        if (loading.value) return;

        loading.value = true;

        try {
            const response = await SupportService.unseenTickets();

            if (response.data?.result !== undefined) {
                unseenTickets.value = parseInt(response.data.result) || 0;
            }
        } catch (error) {
            console.error('Error fetching unseen tickets:', error);
        } finally {
            loading.value = false;
        }
    };

    const reset = () => {
        unseenTickets.value = 0;
    };

    return { unseenTickets, loading, fetchUnseenTickets, reset };
});
