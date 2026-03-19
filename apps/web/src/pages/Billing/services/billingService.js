import api from '../../../services/api';

export const getBillingSummary = () => api.get('/billing/summary').then(r => r.data);
export const getOverdueInvoices = (params) => api.get('/billing/overdue', { params }).then(r => r.data);
export const getReceivablesAgeing = () => api.get('/billing/receivables').then(r => r.data);
export const getPaymentsReport = (params) => api.get('/billing/payments-report', { params }).then(r => r.data);
