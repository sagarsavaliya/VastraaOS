import api from '../../../services/api';

/**
 * Dashboard API Service
 * Handles all dashboard-related API calls
 */

/**
 * Get dashboard statistics
 * @returns {Promise} Dashboard stats including orders, revenue, customers, tasks, deliveries
 */
export const getDashboardStats = async () => {
    try {
        const response = await api.get('/dashboard/stats');
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get recent orders
 * @param {number} limit - Number of orders to fetch (default: 10)
 * @returns {Promise} Array of recent orders
 */
export const getRecentOrders = async (params = {}) => {
    try {
        const response = await api.get('/dashboard/recent-orders', {
            params: {
                limit: 5,
                ...params
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get upcoming deliveries
 * @param {number} days - Number of days to look ahead (default: 7)
 * @param {number} limit - Number of deliveries to fetch (default: 20)
 * @returns {Promise} Array of upcoming deliveries
 */
export const getUpcomingDeliveries = async (days = 7, limit = 20) => {
    try {
        const response = await api.get('/dashboard/upcoming-deliveries', {
            params: { days, limit }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} Auth token and user data
 */
export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Verify login OTP and receive auth token.
 * @param {string} email
 * @param {string} otp - 6-digit code
 */
export const verifyLoginOtp = async (email, otp) => {
    try {
        const response = await api.post('/auth/verify-login-otp', { email, otp });
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Resend login OTP.
 * @param {string} email
 */
export const resendLoginOtp = async (email) => {
    try {
        const response = await api.post('/auth/resend-login-otp', { email });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Logout user
 */
export const logout = async () => {
    try {
        await api.post('/auth/logout');
        localStorage.removeItem('auth_token');
    } catch (error) {
        localStorage.removeItem('auth_token');
        throw error;
    }
};
