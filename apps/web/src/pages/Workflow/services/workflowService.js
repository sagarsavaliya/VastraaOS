import api from '../../../services/api';

export const getKanbanBoard = async (filters = {}) => {
    const response = await api.get('/workflow/board', { params: filters });
    return response.data;
};

export const getMyTasks = async (filters = {}) => {
    const response = await api.get('/workflow/tasks', { params: filters });
    return response.data;
};

export const getTask = async (id) => {
    const response = await api.get(`/workflow/tasks/${id}`);
    return response.data;
};

export const getWorkflowItem = async (id) => {
    const response = await api.get(`/workflow/items/${id}`);
    return response.data;
};

export const updateTaskStatus = async (id, data) => {
    const response = await api.put(`/workflow/tasks/${id}/status`, data);
    return response.data;
};

export const assignTask = async (id, data) => {
    const response = await api.put(`/workflow/tasks/${id}/assign`, data);
    return response.data;
};

export const uploadPhotos = async (id, files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('photos[]', file);
    });

    const response = await api.post(`/workflow/tasks/${id}/photos`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const addComment = async (id, comment, attachmentUrl = null) => {
    const response = await api.post(`/workflow/tasks/${id}/comments`, {
        comment,
        attachment_url: attachmentUrl,
    });
    return response.data;
};

export const getWorkflowList = async (filters = {}) => {
    const response = await api.get('/workflow', { params: filters });
    return response.data;
};

export const getWorkflowStages = async () => {
    const response = await api.get('/masters/workflow-stages');
    return response.data;
};

export const getPriorities = async () => {
    const response = await api.get('/masters/order-priorities');
    return response.data;
};

export const getWorkers = async () => {
    const response = await api.get('/workers');
    return response.data;
};

export const getUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};
