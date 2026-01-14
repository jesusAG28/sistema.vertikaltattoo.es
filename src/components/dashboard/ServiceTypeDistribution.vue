<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

Chart.register(...registerables);

const props = defineProps({
    serviceTypes: {
        type: Array,
        required: true
    },
    comparison: {
        type: Array,
        required: true
    }
});

const chartCanvas = ref(null);
let chartInstance = null;

// Colores para cada tipo de servicio
const serviceColors = [
    '#3498db', // Azul
    '#2ecc71', // Verde
    '#f39c12', // Naranja
    '#9b59b6', // Morado
    '#e74c3c', // Rojo
    '#1abc9c', // Turquesa
    '#34495e' // Gris oscuro
];

const getServiceColor = (serviceTypeId) => {
    const index = props.serviceTypes.findIndex((s) => s.service_type_id === serviceTypeId);
    return serviceColors[index % serviceColors.length];
};

const sortedServices = computed(() => {
    return [...props.serviceTypes].sort((a, b) => b.total_revenue - a.total_revenue);
});

const getComparison = (serviceTypeId) => {
    return props.comparison.find((c) => c.service_type_id === serviceTypeId);
};

const getTrendIcon = (trend) => {
    switch (trend) {
        case 'up':
            return '↑';
        case 'down':
            return '↓';
        case 'stable':
            return '→';
        default:
            return '';
    }
};

const createChart = () => {
    if (!chartCanvas.value) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = chartCanvas.value.getContext('2d');

    const data = props.serviceTypes.map((s) => s.total_revenue);
    const labels = props.serviceTypes.map((s) => s.service_type_name);
    const colors = props.serviceTypes.map((s, index) => serviceColors[index % serviceColors.length]);

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: colors,
                    borderColor: '#fff',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 11
                        },
                        generateLabels: function (chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);

                                    return {
                                        text: `${label} (${percentage}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 13,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);

                            const formattedValue = new Intl.NumberFormat('es-ES', {
                                style: 'currency',
                                currency: 'EUR'
                            }).format(value);

                            return `${label}: ${formattedValue} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
};

onMounted(() => {
    createChart();
});

watch(
    () => props.serviceTypes,
    () => {
        createChart();
    },
    { deep: true }
);

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.destroy();
    }
});
</script>

<template>
    <div class="service-type-distribution">
        <!-- Gráfico de dona -->
        <div class="chart-section">
            <canvas ref="chartCanvas"></canvas>
        </div>

        <!-- Tabla con detalles -->
        <div class="table-section">
            <table class="service-table">
                <thead>
                    <tr>
                        <th>Servicio</th>
                        <th class="text-right">Facturado</th>
                        <th class="text-right">% Total</th>
                        <th class="text-right">Variación</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="service in sortedServices" :key="service.service_type_id">
                        <td>
                            <div class="service-name">
                                <span class="service-color" :style="{ backgroundColor: getServiceColor(service.service_type_id) }"></span>
                                {{ service.service_type_name }}
                            </div>
                        </td>
                        <td class="text-right">{{ formatCurrency(service.total_revenue) }}</td>
                        <td class="text-right">{{ formatPercentage(service.percentage_of_total) }}</td>
                        <td class="text-right">
                            <span class="trend-badge" :class="`trend-${getComparison(service.service_type_id)?.trend}`">
                                <span class="trend-icon">
                                    {{ getTrendIcon(getComparison(service.service_type_id)?.trend) }}
                                </span>
                                {{ formatPercentage(getComparison(service.service_type_id)?.percentage_change) }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.service-type-distribution {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
}

.chart-section {
    position: relative;
    height: 350px;
}

.table-section {
    overflow-x: auto;
}

.service-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.service-table thead th {
    background-color: #f8f9fa;
    padding: 0.75rem;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
}

.service-table tbody td {
    padding: 0.75rem;
    border-bottom: 1px solid #dee2e6;
}

.service-table tbody tr:hover {
    background-color: #f8f9fa;
}

.text-right {
    text-align: right !important;
}

.service-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.service-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
}

.trend-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
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
    font-size: 1rem;
    line-height: 1;
}

@media (max-width: 1024px) {
    .service-type-distribution {
        grid-template-columns: 1fr;
    }

    .chart-section {
        height: 300px;
    }
}

@media (max-width: 768px) {
    .service-table {
        font-size: 0.8rem;
    }

    .service-table thead th,
    .service-table tbody td {
        padding: 0.5rem;
    }
}
</style>
