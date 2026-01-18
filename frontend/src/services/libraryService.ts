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

export const LibraryService = {
    getAllBooks: async (): Promise<Book[]> => {
        const response = await api.get("/library/books");
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

    borrowBook: async (data: { bookId: string, studentId: string, dueDate: string }): Promise<BorrowRecord> => {
        const response = await api.post("/library/borrow", data);
        return response.data;
    },

    returnBook: async (id: string): Promise<BorrowRecord> => {
        const response = await api.patch(`/library/return/${id}`);
        return response.data;
    },

    getOverdueBooks: async (): Promise<BorrowRecord[]> => {
        const response = await api.get("/library/overdue");
        return response.data;
    },

    getStudentHistory: async (studentId: string): Promise<BorrowRecord[]> => {
        const response = await api.get(`/library/history/student/${studentId}`);
        return response.data;
    },

    getAllBorrowRecords: async (): Promise<BorrowRecord[]> => {
        const response = await api.get("/library/borrow-records");
        return response.data;
    }
};
