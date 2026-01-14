<script setup>
import { formatCurrency, formatDate } from '@/utils/formatters';

defineProps({
    invoices: {
        type: Array,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    totalCount: {
        type: Number,
        required: true
    }
});

const getDaysBadgeClass = (days) => {
    if (days >= 60) return 'severe';
    if (days >= 30) return 'high';
    return 'medium';
};
</script>

<template>
    <div class="overdue-invoices">
        <!-- Resumen -->
        <div class="overdue-summary">
            <div class="summary-item">
                <span class="summary-label">Total Vencido:</span>
                <span class="summary-value danger">{{ formatCurrency(totalAmount) }}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Número de Facturas:</span>
                <span class="summary-value">{{ totalCount }}</span>
            </div>
        </div>

        <!-- Tabla -->
        <div class="table-container">
            <table class="invoices-table">
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th class="text-right">Importe</th>
                        <th class="text-center">Días Vencido</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="invoice in invoices" :key="invoice.id">
                        <td>
                            <span class="invoice-number">{{ invoice.full_number }}</span>
                        </td>
                        <td>
                            <div class="client-info">
                                <div class="client-name">{{ invoice.entity_name }}</div>
                                <div class="client-tax-id">{{ invoice.entity_tax_id }}</div>
                            </div>
                        </td>
                        <td>{{ formatDate(invoice.date) }}</td>
                        <td class="text-right">
                            <span class="amount">{{ formatCurrency(invoice.amount) }}</span>
                        </td>
                        <td class="text-center">
                            <span class="days-badge" :class="getDaysBadgeClass(invoice.days_overdue)"> {{ invoice.days_overdue }} días </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.overdue-invoices {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.overdue-summary {
    display: flex;
    gap: 2rem;
    padding: 1rem;
    background-color: #fff5f5;
    border-radius: 6px;
    border: 1px solid #fee;
}

.summary-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.summary-label {
    font-size: 0.85rem;
    color: #666;
    font-weight: 500;
}

.summary-value {
    font-size: 1.3rem;
    font-weight: 700;
    color: #2c3e50;
}

.summary-value.danger {
    color: #e74c3c;
}

.table-container {
    overflow-x: auto;
}

.invoices-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.invoices-table thead th {
    background-color: #f8f9fa;
    padding: 0.75rem;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
    white-space: nowrap;
}

.invoices-table tbody td {
    padding: 0.75rem;
    border-bottom: 1px solid #dee2e6;
}

.invoices-table tbody tr:hover {
    background-color: #f8f9fa;
}

.text-right {
    text-align: right !important;
}

.text-center {
    text-align: center !important;
}

.invoice-number {
    font-weight: 600;
    color: #3498db;
}

.client-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.client-name {
    font-weight: 500;
    color: #2c3e50;
}

.client-tax-id {
    font-size: 0.8rem;
    color: #7f8c8d;
}

.amount {
    font-weight: 600;
    color: #2c3e50;
}

.days-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
}

.days-badge.medium {
    background-color: #fff3cd;
    color: #856404;
}

.days-badge.high {
    background-color: #f8d7da;
    color: #721c24;
}

.days-badge.severe {
    background-color: #e74c3c;
    color: white;
}

@media (max-width: 768px) {
    .overdue-summary {
        flex-direction: column;
        gap: 1rem;
    }

    .invoices-table {
        font-size: 0.8rem;
    }

    .invoices-table thead th,
    .invoices-table tbody td {
        padding: 0.5rem;
    }

    .client-tax-id {
        display: none;
    }
}
</style>
