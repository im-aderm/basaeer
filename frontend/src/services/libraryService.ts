import api from "@/lib/api";

export interface Book {
    id: string;
    title: string;
    author: string;
    isbn?: string;
    category: string;
    quantity: number;
    available: number;
    location?: string;
    description?: string;
    branchId: string;
    createdAt: string;
}

export interface BorrowRecord {
    id: string;
    borrowDate: string;
    dueDate: string;
    returnDate?: string;
    status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
    bookId: string;
    studentId: string;
    book?: Book;
    student?: any;
}

export interface LibraryStats {
    totalBooks: number;
    availableBooks: number;
    borrowedBooks: number;
    overdueBooks: number;
    pendingFines: number;
}

export interface BookCopy {
    id: string;
    barcode: string;
    accessionNumber: string;
    bookId: string;
    status: 'AVAILABLE' | 'BORROWED' | 'LOST' | 'DAMAGED';
    condition?: string;
    book?: Book;
}

export interface BookReservation {
    id: string;
    bookId: string;
    studentId: string;
    status: 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
    reservedAt: string;
    expiresAt: string;
    book?: Book;
    student?: any;
}

export const LibraryService = {
    getAllBooks: async (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
        const response = await api.get("/library/books", { params });
        return response.data;
    },

    getBookById: async (id: string): Promise<Book> => {
        const response = await api.get(`/library/books/${id}`);
        return response.data;
    },

    createBook: async (data: any): Promise<Book> => {
        const response = await api.post("/library/books", data);
        return response.data;
    },

    updateBook: async (id: string, data: any): Promise<Book> => {
        const response = await api.patch(`/library/books/${id}`, data);
        return response.data;
    },

    deleteBook: async (id: string): Promise<any> => {
        const response = await api.delete(`/library/books/${id}`);
        return response.data;
    },

    createBookCopy: async (data: { bookId: string; barcode: string; accessionNumber: string; condition?: string }): Promise<BookCopy> => {
        const response = await api.post("/library/book-copies", data);
        return response.data;
    },

    borrowBook: async (data: { bookId: string, studentId: string, dueDate: string }): Promise<BorrowRecord> => {
        const response = await api.post("/library/borrow", data);
        return response.data;
    },

    borrowBookByBarcode: async (data: { barcode: string; studentId: string; dueDate: string }): Promise<BorrowRecord> => {
        const response = await api.post("/library/borrow-by-barcode", data);
        return response.data;
    },

    reserveBook: async (data: { bookId: string; studentId?: string; expiresAt?: string }): Promise<BookReservation> => {
        const response = await api.post("/library/reservations", data);
        return response.data;
    },

    getReservations: async (status?: string): Promise<BookReservation[]> => {
        const response = await api.get("/library/reservations", { params: status ? { status } : undefined });
        return response.data;
    },

    getMyReservations: async (): Promise<BookReservation[]> => {
        const response = await api.get("/library/my-reservations");
        return response.data;
    },

    cancelReservation: async (id: string): Promise<BookReservation> => {
        const response = await api.patch(`/library/reservations/${id}/cancel`);
        return response.data;
    },

    fulfillReservation: async (id: string): Promise<BorrowRecord> => {
        const response = await api.patch(`/library/reservations/${id}/fulfill`);
        return response.data;
    },

    returnBook: async (id: string): Promise<{ status: string; returnDate: string; fineAmount: number }> => {
        const response = await api.post(`/library/return/${id}`);
        return response.data;
    },

    getOverdueBooks: async (): Promise<BorrowRecord[]> => {
        const response = await api.get("/library/overdue");
        return response.data;
    },

    getStudentHistory: async (studentId: string): Promise<BorrowRecord[]> => {
        const response = await api.get("/library/borrow-records", { params: { studentId } });
        return response.data;
    },

    getMyBorrowHistory: async (): Promise<BorrowRecord[]> => {
        const response = await api.get("/library/my-history");
        return response.data;
    },

    getAllBorrowRecords: async (): Promise<BorrowRecord[]> => {
        const response = await api.get("/library/borrow-records");
        return response.data;
    },

    getLibraryStats: async (): Promise<LibraryStats> => {
        const response = await api.get("/library/stats");
        return response.data;
    }
};
