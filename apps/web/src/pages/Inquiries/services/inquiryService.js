import api from '../../../services/api';

export const getInquiries = async (params = {}) => {
    const response = await api.get('/inquiries', { params });
    return response.data;
};

export const getInquiryStats = async () => {
    // Note: If backend doesn't have a specific inquiry stats endpoint, 
    // we might need to derive it or use a dashboard-like endpoint.
    // For now, assuming current architecture.
    const response = await api.get('/dashboard/stats');
    return response.data.inquiries;
};

export const getInquiry = async (id) => {
    const response = await api.get(`/inquiries/${id}`);
    return response.data;
};

export const createInquiry = async (data) => {
    const response = await api.post('/inquiries', data);
    return response.data;
};

export const updateInquiry = async (id, data) => {
    const response = await api.put(`/inquiries/${id}`, data);
    return response.data;
};

export const deleteInquiry = async (id) => {
    const response = await api.delete(`/inquiries/${id}`);
    return response.data;
};

export const convertToOrder = async (id, data = {}) => {
    const response = await api.post(`/inquiries/${id}/convert`, data);
    return response.data;
};

export const updateInquiryStatus = async (id, status) => {
    const response = await api.put(`/inquiries/${id}/status`, { status });
    return response.data;
};
