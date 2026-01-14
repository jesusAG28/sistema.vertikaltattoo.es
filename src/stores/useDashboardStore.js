import { defineStore } from 'pinia';
import { DashboardService } from '@/service/DashboardService';

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        selectedYear: new Date().getFullYear(),
        yearlyComparison: null,
        overdueInvoices: null,
        revenueByServiceType: null,
        loading: {
            yearlyComparison: false,
            overdueInvoices: false,
            revenueByServiceType: false
        },
        error: null
    }),

    getters: {
        /**
         * Verifica si alguna sección está cargando
         */
        isLoading: (state) => {
            return Object.values(state.loading).some((loading) => loading);
        },

        /**
         * Obtiene los datos del año actual de la comparativa
         */
        currentYearData: (state) => {
            return state.yearlyComparison?.current_year || null;
        },

        /**
         * Obtiene los datos del año anterior de la comparativa
         */
        previousYearData: (state) => {
            return state.yearlyComparison?.previous_year || null;
        },

        /**
         * Obtiene los datos de comparación
         */
        comparisonData: (state) => {
            return state.yearlyComparison?.comparison || null;
        }
    },

    actions: {
        /**
         * Cambia el año seleccionado y recarga todos los datos
         */
        async changeYear(year) {
            this.selectedYear = year;
            await this.loadAllData();
        },

        /**
         * Carga todos los datos del dashboard
         */
        async loadAllData() {
            this.error = null;
            await Promise.all([this.loadYearlyComparison(), this.loadOverdueInvoices(), this.loadRevenueByServiceType()]);
        },

        /**
         * Carga la comparativa anual
         */
        async loadYearlyComparison() {
            this.loading.yearlyComparison = true;
            this.error = null;

            try {
                const response = await DashboardService.getYearlyComparison(this.selectedYear);
                this.yearlyComparison = response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar la comparativa anual';
                console.error('Error loading yearly comparison:', error);
            } finally {
                this.loading.yearlyComparison = false;
            }
        },

        /**
         * Carga las facturas vencidas
         */
        async loadOverdueInvoices() {
            this.loading.overdueInvoices = true;

            try {
                const response = await DashboardService.getOverdueInvoices(this.selectedYear, 10);
                this.overdueInvoices = response.data;
            } catch (error) {
                console.error('Error loading overdue invoices:', error);
            } finally {
                this.loading.overdueInvoices = false;
            }
        },

        /**
         * Carga los ingresos por tipo de servicio
         */
        async loadRevenueByServiceType() {
            this.loading.revenueByServiceType = true;

            try {
                const response = await DashboardService.getRevenueByServiceType(this.selectedYear);
                this.revenueByServiceType = response.data;
            } catch (error) {
                console.error('Error loading revenue by service type:', error);
            } finally {
                this.loading.revenueByServiceType = false;
            }
        },

        /**
         * Reinicia el store
         */
        $reset() {
            this.selectedYear = new Date().getFullYear();
            this.yearlyComparison = null;
            this.overdueInvoices = null;
            this.revenueByServiceType = null;
            this.loading = {
                yearlyComparison: false,
                overdueInvoices: false,
                revenueByServiceType: false
            };
            this.error = null;
        }
    }
});
