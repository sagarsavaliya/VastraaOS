import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/v1`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - clear token and redirect to login
                    localStorage.removeItem('auth_token');
                    // Don't redirect if we're already on signin or if the request was to login
                    if (window.location.pathname !== '/signin' && !error.config.url.includes('/auth/login')) {
                        window.location.href = '/signin';
                    }
                    break;
                case 403:
                    console.error('Access forbidden:', data.message);
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 422:
                    // Validation errors
                    console.error('Validation errors:', data.errors);
                    break;
                case 500:
                    console.error('Server error:', data.message);
                    break;
                default:
                    console.error('API Error:', data.message || 'Unknown error');
            }
        } else if (error.request) {
            // Request made but no response received
            console.error('Network error: No response from server');
        } else {
            // Error in request setup
            console.error('Request error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
