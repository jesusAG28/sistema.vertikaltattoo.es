<script setup>
import UserForm from '@/components/user/UserForm.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});
</script>

<template>
    <UserForm :id="props.id" />
</template>
