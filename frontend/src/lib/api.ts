import axios from 'axios';
import { toast } from 'sonner';

function safeJsonParse(input: string | undefined): any | undefined {
    if (!input) return undefined;
    try {
        return JSON.parse(input);
    } catch {
        return undefined;
    }
}

// Global mutable branch context — set by AuthContext when user changes/selects branch
let _activeBranchId: string | null = null;

// Global callback for context errors — set by ContextErrorModalProvider
let _onContextError: ((error: { code: string; message: string; failedRequest?: { url: string; method: string; data?: any } }) => void) | null = null;

export function setContextErrorCallback(callback: typeof _onContextError) {
    _onContextError = callback;
}

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

// Response interceptor: unwrap standard backend envelope and handle context errors
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
            const status = error.response.status;
            const data = error.response.data;

            // Detect structured context errors from backend
            if (status === 400 && data?.code) {
                if (data.code === 'BRANCH_CONTEXT_REQUIRED' || data.code === 'SESSION_CONTEXT_REQUIRED') {
                    if (_onContextError) {
                        _onContextError({
                            code: data.code,
                            message: data.message,
                            failedRequest: {
                                url: error.config?.url,
                                method: error.config?.method?.toUpperCase(),
                                data: safeJsonParse(error.config?.data),
                            },
                        });
                    }
                    return Promise.reject(error);
                }
            }

            // Detect legacy string errors from Prisma guard
            if (status === 400 && typeof data?.message === 'string') {
                if (data.message.includes('Branch context is required')) {
                    if (_onContextError) {
                        _onContextError({
                            code: 'BRANCH_CONTEXT_REQUIRED',
                            message: 'Branch context is required to modify data. Please select a branch first.',
                            failedRequest: {
                                url: error.config?.url,
                                method: error.config?.method?.toUpperCase(),
                                data: safeJsonParse(error.config?.data),
                            },
                        });
                    }
                    return Promise.reject(error);
                }
                if (data.message.includes('Session context is required')) {
                    if (_onContextError) {
                        _onContextError({
                            code: 'SESSION_CONTEXT_REQUIRED',
                            message: 'Session context is required to modify data. Please select a session first.',
                            failedRequest: {
                                url: error.config?.url,
                                method: error.config?.method?.toUpperCase(),
                                data: safeJsonParse(error.config?.data),
                            },
                        });
                    }
                    return Promise.reject(error);
                }
            }

            if (process.env.NODE_ENV === 'development') console.error('API Error Response:', {
                status: error.response.status,
                data: error.response.data,
                url: error.config?.url,
                method: error.config?.method,
            });

            // Show generic toast for 500/unhandled errors
            if (status >= 500) {
                toast.error(data?.message || 'Server error. Please try again.');
            } else {
                toast.error(data?.message || 'Request failed. Please try again.');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
