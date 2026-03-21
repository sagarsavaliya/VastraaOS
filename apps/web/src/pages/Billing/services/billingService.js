import api from '../../../services/api';

export const getBillingSummary = (params) => api.get('/billing/summary', { params }).then(r => r.data);
export const getOverdueInvoices = (params) => api.get('/billing/overdue', { params }).then(r => r.data);
export const getReceivablesAgeing = (params) => api.get('/billing/receivables', { params }).then(r => r.data);
export const getPaymentsReport = (params) => api.get('/billing/payments-report', { params }).then(r => r.data);
