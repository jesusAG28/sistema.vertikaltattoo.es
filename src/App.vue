<script setup>
import { onMounted } from 'vue';
onMounted(() => {
    console.log('%c /conwork ', 'background-color: #464646;color:white;font-size:30px;padding: 0 1rem;');
    console.log('%c ⚙️ Admin panel development with ❤️ by /conwork ⚙️ ', 'background-color: #343434;color:white;font-size:12px;padding:0.25rem');
});
</script>

<template>
    <router-view />
</template>

<style></style>
