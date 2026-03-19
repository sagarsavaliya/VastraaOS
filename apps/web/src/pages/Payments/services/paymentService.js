import api from '../../../services/api';

export const getPayments = (params) => api.get('/payments', { params }).then(r => r.data);
export const getPayment = (id) => api.get(`/payments/${id}`).then(r => r.data);
export const recordPayment = (data) => api.post('/payments', data).then(r => r.data);
export const getOrderPaymentSummary = (orderId) => api.get(`/orders/${orderId}/payment-summary`).then(r => r.data);
export const voidPayment = (id, reason) => api.post(`/payments/${id}/void`, { void_reason: reason }).then(r => r.data);
export const refundPayment = (id, data) => api.post(`/payments/${id}/refund`, data).then(r => r.data);
