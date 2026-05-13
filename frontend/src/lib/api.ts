import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    withCredentials: true, // Crucial for sending/receiving httpOnly auth cookies across domains
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    }
});

// ── Response Interceptor: handle expired/invalid sessions ────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log detailed error info for debugging
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
            // Session is expired or invalid — redirect to login if inside the dashboard
            if (window.location.pathname.startsWith('/dashboard')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
