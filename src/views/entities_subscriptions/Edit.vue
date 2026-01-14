<script setup>
import EntitySubscriptionForm from '@/components/entitysubscription/EntitySubscriptionForm.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});
</script>

<template>
    <EntitySubscriptionForm :id="props.id" />
</template>
