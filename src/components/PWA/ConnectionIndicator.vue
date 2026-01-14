<script setup>
import { useConnectionStatus } from '@/composables/useConnectionStatus';
import { useToast } from 'primevue/usetoast';
import { watch } from 'vue';

const { isOnline } = useConnectionStatus();
const toast = useToast();

// Mostrar toast cuando cambie el estado
watch(isOnline, (newValue, oldValue) => {
    if (oldValue !== undefined) {
        // Evitar toast inicial
        if (newValue) {
            toast.add({
                severity: 'success',
                summary: 'Conexión restaurada',
                detail: 'Ya tienes acceso a internet',
                life: 3000
            });
        } else {
            toast.add({
                severity: 'warn',
                summary: 'Sin conexión',
                detail: 'Trabajando en modo offline',
                life: 5000
            });
        }
    }
});
</script>

<template>
    <div v-if="!isOnline" class="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium">
        <i class="pi pi-wifi mr-2" />
        Modo offline - Los cambios se sincronizarán cuando recuperes la conexión
    </div>
</template>
