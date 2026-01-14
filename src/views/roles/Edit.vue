<script setup>
import RoleForm from '@/components/role/RoleForm.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});
</script>

<template>
    <RoleForm :id="props.id" />
</template>
