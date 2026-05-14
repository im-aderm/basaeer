import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    withCredentials: true, // Crucial for sending/receiving httpOnly auth cookies across domains
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    }
});

// ── Response Interceptor: unwrap backend envelope + handle errors ────────────
api.interceptors.response.use(
    (response) => {
        // Unwrap the standard backend envelope: { success: true, data: ... }
        if (
            response.data &&
            typeof response.data === 'object' &&
            response.data.success === true &&
            'data' in response.data
        ) {
            return { ...response, data: response.data.data };
        }
        return response;
    },
    (error) => {
        if (error.response) {
            if (process.env.NODE_ENV === 'development') console.error('API Error Response:', {
                status: error.response.status,
                data: error.response.data,
                url: error.config?.url,
                method: error.config?.method,
            });
        }
        
        if (
            typeof window !== 'undefined' &&
            error.response?.status === 401
        ) {
            if (window.location.pathname.startsWith('/dashboard')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
