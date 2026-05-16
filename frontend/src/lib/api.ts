import axios from 'axios';

// Global mutable branch context — set by AuthContext when user changes/selects branch
let _activeBranchId: string | null = null;

export function setApiBranchContext(branchId: string | null | undefined) {
    // "__all__" is a sentinel for "All Campuses" — never inject it into API calls
    _activeBranchId = (branchId && branchId !== "__all__") ? branchId : null;
}

export function getApiBranchContext(): string | null {
    return _activeBranchId;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    withCredentials: true,
    timeout: 15000,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    }
});

// Request interceptor: auto-inject branchId on all requests except global routes
api.interceptors.request.use((config) => {
    if (_activeBranchId && config.url) {
        // Skip routes that should never receive branch context
        const skip = ['/auth/', '/branches', '/health', '/search'];
        if (!skip.some((s) => config.url!.includes(s))) {
            config.params = { ...config.params, branchId: _activeBranchId };
        }
    }
    return config;
});

// Response interceptor: unwrap standard backend envelope
api.interceptors.response.use(
    (response) => {
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
        return Promise.reject(error);
    }
);

export default api;
