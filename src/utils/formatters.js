/**
 * Formatea un número como moneda en euros
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales (default: 2)
 * @returns {string}
 */
export const formatCurrency = (value, decimals = 2) => {
    if (value === null || value === undefined) return '0,00 €';

    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
};

/**
 * Formatea un número
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales (default: 0)
 * @returns {string}
 */
export const formatNumber = (value, decimals = 0) => {
    if (value === null || value === undefined) return '0';

    return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales (default: 2)
 * @returns {string}
 */
export const formatPercentage = (value, decimals = 2) => {
    if (value === null || value === undefined) return '0%';

    return `${formatNumber(value, decimals)}%`;
};

/**
 * Formatea una fecha
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string}
 */
export const formatDate = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
};
