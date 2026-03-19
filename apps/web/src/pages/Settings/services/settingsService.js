import api from '../../../services/api';

export const getTenantSettings = () => api.get('/settings/tenant');
export const updateTenantSettings = (data) => api.put('/settings/tenant', data);
export const getUsers = (params) => api.get('/users', { params });
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const updateUserStatus = (id, is_active) => api.put(`/users/${id}/status`, { is_active });
export const updateUserRole = (id, role) => api.put(`/users/${id}/role`, { role });
export const getSubscription = () => api.get('/settings/subscription');
