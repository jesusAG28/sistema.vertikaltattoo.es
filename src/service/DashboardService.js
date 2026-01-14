import { ApiService } from './ApiService';

export const DashboardService = {
    /**
     * Obtiene la comparativa anual de facturación
     * @param {number} year - Año a consultar
     * @returns {Promise}
     */
    getYearlyComparison: async (year) => {
        return await ApiService.get(`/dashboard/billing/yearly-comparison`, {
            params: { year }
        });
    },

    /**
     * Obtiene las facturas vencidas del año
     * @param {number} year - Año a consultar
     * @param {number} limit - Número máximo de facturas
     * @returns {Promise}
     */
    getOverdueInvoices: async (year, limit = 10) => {
        return await ApiService.get(`/dashboard/billing/overdue`, {
            params: { year, limit }
        });
    },

    /**
     * Obtiene los ingresos por tipo de servicio
     * @param {number} year - Año a consultar
     * @returns {Promise}
     */
    getRevenueByServiceType: async (year) => {
        return await ApiService.get(`/dashboard/revenue-by-service-type`, {
            params: { year }
        });
    }
};
