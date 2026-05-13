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
    fines?: any[];
}

export interface LibraryStats {
    totalBooks: number;
    availableBooks: number;
    borrowedBooks: number;
    overdueBooks: number;
    pendingFines: number;
}

export interface IssueBookDto {
    bookId: string;
    studentId: string;
    dueDate: string;
}
