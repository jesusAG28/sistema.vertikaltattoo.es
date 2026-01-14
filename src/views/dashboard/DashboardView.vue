<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { useI18n } from 'vue-i18n';
import KpiCard from '@/components/dashboard/KpiCard.vue';
import MonthlyComparisonChart from '@/components/dashboard/MonthlyComparisonChart.vue';
import ServiceTypeDistribution from '@/components/dashboard/ServiceTypeDistribution.vue';
import OverdueInvoicesTable from '@/components/dashboard/OverdueInvoicesTable.vue';

const { t } = useI18n();

const dashboardStore = useDashboardStore();

// Estado local
const selectedYear = ref(new Date().getFullYear());

// Años disponibles (últimos 5 años)
const availableYears = computed(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
        years.push(currentYear - i);
    }
    return years;
});

// Getters del store
const currentYearData = computed(() => dashboardStore.currentYearData);
const previousYearData = computed(() => dashboardStore.previousYearData);
const comparisonData = computed(() => dashboardStore.comparisonData);
const overdueInvoices = computed(() => dashboardStore.overdueInvoices);
const revenueByServiceType = computed(() => dashboardStore.revenueByServiceType);

// Métodos
const handleYearChange = async () => {
    await dashboardStore.changeYear(selectedYear.value);
};

const refreshData = async () => {
    await dashboardStore.loadAllData();
};

// Lifecycle
onMounted(async () => {
    await dashboardStore.loadAllData();
});
</script>

<template>
    <div class="dashboard-view">
        <!-- Header con selector de año y botón refresh -->
        <div class="dashboard-header">
            <h1>{{ t('dashboard.title') }}</h1>

            <div class="dashboard-controls">
                <select v-model="selectedYear" @change="handleYearChange" class="year-selector">
                    <option v-for="year in availableYears" :key="year" :value="year">
                        {{ year }}
                    </option>
                </select>

                <button @click="refreshData" :disabled="dashboardStore.isLoading" class="btn-refresh">
                    <span v-if="!dashboardStore.isLoading">{{ t('dashboard.refresh') }}</span>
                    <span v-else>{{ t('dashboard.loading') }}</span>
                </button>
            </div>
        </div>

        <!-- Error general -->
        <div v-if="dashboardStore.error" class="alert alert-error">
            {{ dashboardStore.error }}
        </div>

        <!-- KPIs principales -->
        <div class="kpi-container">
            <KpiCard title="Total Facturado" :subtitle="t('dashboard.year') + ` ${selectedYear}`" :value="formatCurrency(currentYearData?.total_billed)" :loading="dashboardStore.loading.yearlyComparison" />

            <KpiCard title="Total Facturado" :subtitle="t('dashboard.year') + ` ${selectedYear - 1}`" :value="formatCurrency(previousYearData?.total_billed)" :loading="dashboardStore.loading.yearlyComparison" />

            <KpiCard title="Variación" :subtitle="`${selectedYear} vs ${selectedYear - 1}`" :value="formatPercentage(comparisonData?.total_percentage_change)" :trend="comparisonData?.trend" :loading="dashboardStore.loading.yearlyComparison" />

            <KpiCard title="Pendiente de Cobro" :subtitle="t('dashboard.year') + ` ${selectedYear}`" :value="formatCurrency(currentYearData?.pending_amount)" :loading="dashboardStore.loading.yearlyComparison" variant="warning" />
        </div>

        <!-- Gráfico de evolución mensual comparativa -->
        <div class="dashboard-section">
            <h2>{{ t('dashboard.monthly_comparison') }}</h2>

            <div v-if="dashboardStore.loading.yearlyComparison" class="loading-state">{{ t('dashboard.loading') }}</div>

            <MonthlyComparisonChart
                v-else-if="currentYearData && previousYearData"
                :current-year-data="currentYearData.monthly_data"
                :previous-year-data="previousYearData.monthly_data"
                :current-year="selectedYear"
                :previous-year="selectedYear - 1"
            />

            <div v-else class="empty-state">{{ t('dashboard.no_data') }}</div>
        </div>

        <!-- Distribución por tipo de servicio -->
        <div class="dashboard-section">
            <h2>{{ t('dashboard.service_type_distribution') }}</h2>

            <div v-if="dashboardStore.loading.revenueByServiceType" class="loading-state">{{ t('dashboard.loading') }}</div>

            <ServiceTypeDistribution v-else-if="revenueByServiceType" :service-types="revenueByServiceType.current_year.by_service_type" :comparison="revenueByServiceType.comparison.by_service_type" />

            <div v-else class="empty-state">{{ t('dashboard.no_data') }}</div>
        </div>

        <!-- Facturas vencidas -->
        <div class="dashboard-section">
            <h2>{{ t('dashboard.overdue_invoices') }} ({{ selectedYear }})</h2>

            <div v-if="dashboardStore.loading.overdueInvoices" class="loading-state">{{ t('dashboard.loading') }}</div>

            <OverdueInvoicesTable v-else-if="overdueInvoices && overdueInvoices.invoices.length > 0" :invoices="overdueInvoices.invoices" :total-amount="overdueInvoices.total_overdue_amount" :total-count="overdueInvoices.overdue_count" />

            <div v-else class="empty-state success">{{ t('dashboard.no_overdue_invoices') }}</div>
        </div>
    </div>
</template>

<style scoped>
.dashboard-view {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.dashboard-header h1 {
    margin: 0;
    font-size: 2rem;
    color: #2c3e50;
}

.dashboard-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.year-selector {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    transition: border-color 0.2s;
}

.year-selector:hover {
    border-color: #3498db;
}

.year-selector:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.btn-refresh {
    padding: 0.5rem 1.5rem;
    font-size: 1rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-refresh:hover:not(:disabled) {
    background-color: #2980b9;
}

.btn-refresh:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
}

.alert {
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-radius: 4px;
    font-weight: 500;
}

.alert-error {
    background-color: #fee;
    color: #c33;
    border: 1px solid #fcc;
}

.kpi-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.dashboard-section {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-section h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 0.5rem;
}

.loading-state {
    text-align: center;
    padding: 3rem;
    color: #7f8c8d;
    font-size: 1.1rem;
}

.empty-state {
    text-align: center;
    padding: 3rem;
    color: #95a5a6;
    font-size: 1.1rem;
}

.empty-state.success {
    color: #27ae60;
    font-weight: 500;
}

@media (max-width: 768px) {
    .dashboard-view {
        padding: 1rem;
    }

    .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .dashboard-controls {
        width: 100%;
        flex-direction: column;
    }

    .year-selector,
    .btn-refresh {
        width: 100%;
    }

    .kpi-container {
        grid-template-columns: 1fr;
    }
}
</style>
