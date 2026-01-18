export class CreateInvoiceDto {
    studentId: string;
    dueDate: string; // ISO string
    branchId: string;
    items: {
        categoryId: string;
        amount: number;
    }[];
}
