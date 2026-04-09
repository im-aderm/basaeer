import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    withCredentials: true, // Crucial for sending/receiving httpOnly auth cookies across domains
});

// ── Response Interceptor: handle expired/invalid sessions ────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            typeof window !== 'undefined' &&
            error.response?.status === 401
        ) {
            // Session is expired or invalid — redirect to login
            // Avoid redirect loops: only redirect if not already on login page
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
