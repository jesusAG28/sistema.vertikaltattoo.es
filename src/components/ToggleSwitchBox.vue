<script setup>
defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    inputId: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    hint: {
        type: String,
        default: null
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'activated']);

const handleUpdate = (value) => {
    emit('update:modelValue', value);
    if (value === true) {
        emit('activated');
    }
};
</script>

<template>
    <div class="flex items-center gap-3 p-3 border rounded-lg container" :class="{ 'opacity-60 cursor-not-allowed': disabled }">
        <ToggleSwitch :model-value="modelValue" @update:model-value="handleUpdate" :input-id="inputId" :name="inputId" :disabled="disabled" />
        <label :for="inputId" class="first-letter:uppercase font-medium text-sm hyphens-auto flex-1" :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'">
            {{ label }}
        </label>
        <i v-if="hint" v-tooltip.left="hint" class="pi pi-info-circle text-surface-400 cursor-help text-sm hint-icon" />
    </div>
</template>

<style scoped>
.container {
    transition: all 0.3s ease;
}
.container:not(.opacity-60):hover {
    border-color: var(--p-inputtext-border-color);
    background-color: var(--p-surface-50);
}
.hint-icon {
    transition: color 0.2s ease;
}
.hint-icon:hover {
    color: var(--p-surface-600);
}
</style>
