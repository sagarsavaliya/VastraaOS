import api from '../../../services/api';

export const getInvoices = (params) => api.get('/invoices', { params }).then(r => r.data);
export const getInvoice = (id) => api.get(`/invoices/${id}`).then(r => r.data);
export const createInvoice = (data) => api.post('/invoices', data).then(r => r.data);
export const updateInvoice = (id, data) => api.patch(`/invoices/${id}`, data).then(r => r.data);
export const updateInvoiceStatus = (id, status) => api.put(`/invoices/${id}/status`, { status }).then(r => r.data);
export const cancelInvoice = (id, reason) => api.post(`/invoices/${id}/cancel`, { cancellation_reason: reason }).then(r => r.data);
export const sendInvoice = (id) => api.post(`/invoices/${id}/send`).then(r => r.data);
export const getInvoicePdfUrl = (id) => `${import.meta.env.VITE_API_URL}/invoices/${id}/pdf`;
export const getOrdersForInvoice = (search) => api.get('/orders', { params: { search, per_page: 20 } }).then(r => r.data);
export const getHsnCodes = (search) => api.get('/hsn-codes', { params: { search } }).then(r => r.data);
export const getInvoiceKPIs = (params) => api.get('/invoices/kpis', { params }).then(r => r.data);
