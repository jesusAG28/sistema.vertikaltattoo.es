<script setup>
import { computed } from 'vue';

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        default: ''
    },
    value: {
        type: String,
        required: true
    },
    trend: {
        type: String,
        default: null,
        validator: (value) => [null, 'up', 'down', 'stable'].includes(value)
    },
    variant: {
        type: String,
        default: 'default',
        validator: (value) => ['default', 'primary', 'success', 'warning', 'danger'].includes(value)
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const variantClass = computed(() => `kpi-${props.variant}`);

const trendIcon = computed(() => {
    switch (props.trend) {
        case 'up':
            return '↑';
        case 'down':
            return '↓';
        case 'stable':
            return '→';
        default:
            return '';
    }
});
</script>

<template>
    <div class="kpi-card" :class="[variantClass, { 'has-trend': trend }]">
        <div v-if="loading" class="kpi-loading">
            <div class="spinner" />
        </div>

        <template v-else>
            <div class="kpi-header">
                <h3 class="kpi-title">{{ title }}</h3>
                <span v-if="subtitle" class="kpi-subtitle">{{ subtitle }}</span>
            </div>

            <div class="kpi-value-container">
                <div class="kpi-value">{{ value }}</div>

                <div v-if="trend" class="kpi-trend" :class="`trend-${trend}`">
                    <span class="trend-icon">{{ trendIcon }}</span>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.kpi-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition:
        transform 0.2s,
        box-shadow 0.2s;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.kpi-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.kpi-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: 100px;
}

.spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.kpi-header {
    margin-bottom: 1rem;
}

.kpi-title {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #7f8c8d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.kpi-subtitle {
    display: block;
    font-size: 0.8rem;
    color: #95a5a6;
    margin-top: 0.25rem;
}

.kpi-value-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

.kpi-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2c3e50;
    line-height: 1;
}

.kpi-trend {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 1.5rem;
    font-weight: 700;
}

.trend-up {
    background-color: #d4edda;
    color: #27ae60;
}

.trend-down {
    background-color: #f8d7da;
    color: #e74c3c;
}

.trend-stable {
    background-color: #d1ecf1;
    color: #3498db;
}

.trend-icon {
    line-height: 1;
}

/* Variantes */
.kpi-primary {
    border-left: 4px solid #3498db;
}

.kpi-success {
    border-left: 4px solid #27ae60;
}

.kpi-warning {
    border-left: 4px solid #f39c12;
}

.kpi-danger {
    border-left: 4px solid #e74c3c;
}

.kpi-default {
    border-left: 4px solid #95a5a6;
}

@media (max-width: 768px) {
    .kpi-value {
        font-size: 1.5rem;
    }

    .kpi-trend {
        width: 35px;
        height: 35px;
        font-size: 1.2rem;
    }
}
</style>
