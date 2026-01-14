<script setup>
import InvoiceForm from '@/components/invoices/InvoiceForm.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});
</script>

<template>
    <InvoiceForm :id="props.id" />
</template>