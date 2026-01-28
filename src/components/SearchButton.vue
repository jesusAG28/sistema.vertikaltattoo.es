<script setup>
defineProps({
    title: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: 'pi pi-search'
    }
});
</script>

<template>
    <Button type="submit" class="group !p-0" :title="title">
        <span class="flex items-center px-3 py-2">
            <i :class="icon" class="transition-all duration-500 ease-in-out group-hover:mr-2" />
            <span class="inline-block max-w-0 opacity-0 overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out group-hover:max-w-[150px] group-hover:opacity-100">
                {{ title }}
            </span>
        </span>
    </Button>
</template>
