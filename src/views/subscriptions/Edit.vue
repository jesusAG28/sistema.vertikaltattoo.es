<script setup>
import SubscriptionForm from '@/components/subscription/SubscriptionForm.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});
</script>

<template>
    <SubscriptionForm :id="props.id" />
</template>
