<script setup>
import EntityForm from '@/components/entity/EntityForm.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});
</script>

<template>
    <EntityForm :id="props.id" />
</template>
