<script setup>
import { useI18n } from 'vue-i18n';

const props = defineProps({
    appliedFilters: {
        Type: Object,
        required: true
    }
});

const { t } = useI18n();

const chipStyle = {
    'border-radius': '4px'
};
</script>

<template>
    <div class="flex flex-wrap gap-2 w-full">
        <template v-for="filter of props.appliedFilters" :key="filter">
            <Chip :style="chipStyle">
                <span class="first-letter:uppercase">{{ t(filter.label) }}:</span>
                <span>{{ filter.translatable ? t(filter.translatable) : filter.value }}</span>
            </Chip>
        </template>
    </div>
</template>
