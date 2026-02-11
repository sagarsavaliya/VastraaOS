import api from '../../../services/api';

export const getOrders = async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
};

export const getOrderStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data.orders;
};

export const getOrder = async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};

export const createOrder = async (data) => {
    const response = await api.post('/orders', data);
    return response.data;
};

export const updateOrder = async (id, data) => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
};

export const deleteOrder = async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
};

export const updateOrderStatus = async (id, statusId) => {
    const response = await api.put(`/orders/${id}/status`, { status_id: statusId });
    return response.data;
};

export const getOrderWorkflow = async (id) => {
    const response = await api.get(`/orders/${id}/workflow`);
    return response.data;
};
