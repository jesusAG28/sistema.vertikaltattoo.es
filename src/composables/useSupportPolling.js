import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSupportStore } from '@/stores/support';
import { useAuthStore } from '@/stores/auth';

export function useSupportPolling(intervalMinutes = 5) {
    const supportStore = useSupportStore();
    const authStore = useAuthStore();
    const route = useRoute();

    let intervalId = null;

    const startPolling = () => {
        if (!authStore.user?.support_token) return;

        // Fetch inmediatamente
        supportStore.fetchUnseenTickets();

        // Configurar intervalo
        intervalId = setInterval(
            () => {
                supportStore.fetchUnseenTickets();
            },
            intervalMinutes * 60 * 1000
        );
    };

    const stopPolling = () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };

    // Watch route changes
    watch(
        () => route.path,
        () => {
            if (authStore.user?.support_token) {
                supportStore.fetchUnseenTickets();
            }
        }
    );

    onMounted(() => {
        startPolling();
    });

    onUnmounted(() => {
        stopPolling();
    });

    return {
        startPolling,
        stopPolling
    };
}
