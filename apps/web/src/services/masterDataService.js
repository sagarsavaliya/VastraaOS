import api from './api';

export const getItemTypes = async () => {
    const response = await api.get('/masters/item-types');
    return response.data.data;
};

export const getInquirySources = async () => {
    const response = await api.get('/masters/inquiry-sources');
    return response.data.data;
};

export const getOccasions = async () => {
    const response = await api.get('/masters/occasions');
    return response.data.data;
};

export const getBudgetRanges = async () => {
    const response = await api.get('/masters/budget-ranges');
    return response.data.data;
};

export const getOrderStatuses = async () => {
    const response = await api.get('/masters/order-statuses');
    return response.data.data;
};

export const getOrderPriorities = async () => {
    const response = await api.get('/masters/order-priorities');
    return response.data.data;
};

export const getWorkTypes = async () => {
    const response = await api.get('/masters/work-types');
    return response.data.data;
};

export const getWorkflowStages = async () => {
    const response = await api.get('/masters/workflow-stages');
    return response.data.data;
};
