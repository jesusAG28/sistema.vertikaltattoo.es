<script setup>
const spinnerStyle = {
    '--p-progressspinner-color-one': 'var(--p-primary-color)',
    '--p-progressspinner-color-two': 'var(--p-primary-600)',
    '--p-progressspinner-color-three': 'white',
    '--p-progressspinner-color-four': 'var(--p-primary-400)'
};
</script>

<template>
    <ProgressSpinner :style="spinnerStyle" />
</template>
