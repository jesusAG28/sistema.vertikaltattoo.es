<script setup>
import { useAuthStore } from '@/stores/auth';
import { useSupportStore } from '@/stores/support';

const authStore = useAuthStore();
const supportStore = useSupportStore();
</script>

<template>
    <a v-if="authStore.user?.support_token" :href="`https://soporte.conwork.tech/auth_token.php?token_system=${authStore.user.support_token}`" class="right-sidebar-button relative" style="overflow: visible">
        <i class="pi pi-headphones" />
        <span v-if="supportStore.unseenTickets > 0" class="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold z-10">
            {{ supportStore.unseenTickets > 9 ? '9+' : supportStore.unseenTickets }}
        </span>
    </a>
</template>
