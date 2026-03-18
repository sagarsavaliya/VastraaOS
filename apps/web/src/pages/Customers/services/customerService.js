import api from '../../../services/api';

export const getCustomers = async (params = {}) => {
    const response = await api.get('/customers', { params });
    return response.data;
};

export const getCustomerStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data.customers;
};

export const getCustomer = async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
};

export const createCustomer = async (data) => {
    const response = await api.post('/customers', data);
    return response.data;
};

export const updateCustomer = async (id, data) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
};

export const deleteCustomer = async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
};

export const getCustomerOrders = async (id) => {
    const response = await api.get(`/customers/${id}/orders`);
    return response.data;
};

export const getCustomerMeasurements = async (id) => {
    const response = await api.get(`/customers/${id}/measurements`);
    return response.data;
};

export const getMeasurementTypes = async () => {
    const response = await api.get('/masters/measurement-types');
    return response.data;
};

export const createMeasurementProfile = async (data) => {
    const response = await api.post('/measurements/profiles', data);
    return response.data;
};

export const updateMeasurementProfile = async (id, data) => {
    const response = await api.put(`/measurements/profiles/${id}`, data);
    return response.data;
};

export const deleteMeasurementProfile = async (id) => {
    const response = await api.delete(`/measurements/profiles/${id}`);
    return response.data;
};

export const createMeasurementRecord = async (data) => {
    const response = await api.post('/measurements/records', data);
    return response.data;
};

export const updateMeasurementRecord = async (id, data) => {
    const response = await api.put(`/measurements/records/${id}`, data);
    return response.data;
};

export const deleteMeasurementRecord = async (id) => {
    const response = await api.delete(`/measurements/records/${id}`);
    return response.data;
};
