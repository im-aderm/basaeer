import api from '@/lib/api';

export interface SearchResults {
    students: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email?: string;
    }>;
    staff: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    }>;
    inventory: Array<{
        id: string;
        name: string;
        stock: number;
    }>;
    events: Array<{
        id: string;
        title: string;
        startDate: string;
    }>;
}

export const searchService = {
    globalSearch: async (query: string): Promise<SearchResults> => {
        if (!query || query.length < 2) {
            return { students: [], staff: [], inventory: [], events: [] };
        }
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        return response.data;
    },
};
