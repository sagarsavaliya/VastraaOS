import api from '../../../services/api';

export const getExpenseDashboard = async (params = {}) => {
    const response = await api.get('/expenses/dashboard', { params });
    return response.data;
};

export const getExpenses = async (params = {}) => {
    const response = await api.get('/expenses', { params });
    return response.data;
};

export const getExpense = async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
};

export const createExpense = async (data) => {
    const response = await api.post('/expenses', data);
    return response.data;
};

export const updateExpense = async (id, data) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
};

export const deleteExpense = async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
};

export const approveExpense = async (id, notes = '') => {
    const response = await api.post(`/expenses/${id}/approve`, { approval_notes: notes });
    return response.data;
};

export const rejectExpense = async (id, reason) => {
    const response = await api.post(`/expenses/${id}/reject`, { rejection_reason: reason });
    return response.data;
};

export const getExpenseCategories = async () => {
    const response = await api.get('/expenses/categories');
    return response.data;
};

export const createExpenseCategory = async (data) => {
    const response = await api.post('/expenses/categories', data);
    return response.data;
};

export const getExpenseGroups = async () => {
    const response = await api.get('/expenses/groups');
    return response.data;
};

export const createExpenseGroup = async (data) => {
    const response = await api.post('/expenses/groups', data);
    return response.data;
};

export const uploadExpenseReceipt = async (id, file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    const response = await api.post(`/expenses/${id}/receipts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteExpenseReceipt = async (id, index) => {
    const response = await api.delete(`/expenses/${id}/receipts/${index}`);
    return response.data;
};
