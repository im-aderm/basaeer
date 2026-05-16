import api from '@/lib/api';

export interface StudentResult {
    id: string;
    firstName: string;
    lastName: string;
}

export interface StaffResult {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

export interface InventoryResult {
    id: string;
    name: string;
    stock: number;
}

export interface BookResult {
    id: string;
    title: string;
    author: string;
    isbn?: string;
    available: number;
}

export interface InvoiceResult {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    status: string;
    student: { firstName: string; lastName: string } | null;
}

export interface HostelResult {
    id: string;
    name: string;
    type: string;
}

export interface ClassResult {
    id: string;
    name: string;
    description: string | null;
}

export interface EventResult {
    id: string;
    title: string;
    eventDate: string;
}

export interface SearchResults {
    students: StudentResult[];
    staff: StaffResult[];
    inventory: InventoryResult[];
    books: BookResult[];
    invoices: InvoiceResult[];
    hostel: HostelResult[];
    classes: ClassResult[];
    events: EventResult[];
}

export const searchService = {
    globalSearch: async (query: string): Promise<SearchResults> => {
        if (!query || query.length < 2) {
            return { students: [], staff: [], inventory: [], books: [], invoices: [], hostel: [], classes: [], events: [] };
        }
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        return response.data;
    },
};
