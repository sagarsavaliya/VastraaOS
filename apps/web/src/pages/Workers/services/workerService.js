import api from '../../../services/api';

export const getWorkers = async (params = {}) => {
    const response = await api.get('/workers', { params });
    return response.data;
};

export const getWorkerStats = async () => {
    const response = await api.get('/workers/stats');
    return response.data;
};

export const getWorker = async (id) => {
    const response = await api.get(`/workers/${id}`);
    return response.data;
};

export const createWorker = async (data) => {
    const response = await api.post('/workers', data);
    return response.data;
};

export const updateWorker = async (id, data) => {
    const response = await api.put(`/workers/${id}`, data);
    return response.data;
};

export const deleteWorker = async (id) => {
    const response = await api.delete(`/workers/${id}`);
    return response.data;
};

export const getWorkerSkills = async (id) => {
    const response = await api.get(`/workers/${id}/skills`);
    return response.data;
};

export const addWorkerSkill = async (id, data) => {
    const response = await api.post(`/workers/${id}/skills`, data);
    return response.data;
};

export const removeWorkerSkill = async (id, skillId) => {
    const response = await api.delete(`/workers/${id}/skills/${skillId}`);
    return response.data;
};

export const getWorkerAssignments = async (id) => {
    const response = await api.get(`/workers/${id}/assignments`);
    return response.data;
};
