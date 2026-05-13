import api from '@/lib/api';

export interface FeeCategory {
  id: string;
  name: string;
  description?: string;
  branchId: string;
}

export interface FeeStructure {
  id: string;
  amount: number;
  categoryId: string;
  classId?: string;
  branchId: string;
  category?: { name: string };
  class?: { name: string };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  dueDate: string;
  totalAmount: number;
  balance: number;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  studentId: string;
  branchId: string;
  items?: InvoiceItem[];
  payments?: Payment[];
  student?: { firstName: string; lastName: string };
}

export interface InvoiceItem {
  id: string;
  amount: number;
  invoiceId: string;
  categoryId: string;
  category?: { name: string };
}

export interface Payment {
  id: string;
  amount: number;
  method: 'PAYSTACK' | 'FLUTTERWAVE' | 'BANK_TRANSFER' | 'CASH';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REJECTED';
  transactionId?: string;
  proofUrl?: string;
  invoiceId: string;
}

export interface Voucher {
  id: string;
  voucherNumber: string;
  date: string;
  amount: number;
  description: string;
  expenseCategoryId: string;
  paidTo: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  branchId: string;
  category?: { name: string };
  approvedBy?: { firstName: string; lastName: string };
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  branchId: string;
}

export interface BranchFinancials {
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionEfficiency: number;
  paymentMethods: { method: string; total: number }[];
}

export const financeService = {
  getStats: async (): Promise<BranchFinancials> => {
    const res = await api.get('/finance/stats');
    return res.data;
  },

  getFeeCategories: async (): Promise<FeeCategory[]> => {
    const res = await api.get('/finance/fee-categories');
    return res.data;
  },

  createFeeCategory: async (data: { name: string; description?: string; branchId: string }): Promise<FeeCategory> => {
    const res = await api.post('/finance/fee-categories', data);
    return res.data;
  },

  getFeeStructures: async (): Promise<FeeStructure[]> => {
    const res = await api.get('/finance/fee-structures');
    return res.data;
  },

  createFeeStructure: async (data: { amount: number; categoryId: string; classId?: string; branchId: string }): Promise<FeeStructure> => {
    const res = await api.post('/finance/fee-structures', data);
    return res.data;
  },

  createInvoice: async (data: { studentId: string; dueDate: string; items: { amount: number; categoryId: string }[]; branchId: string }): Promise<Invoice> => {
    const res = await api.post('/finance/invoices', data);
    return res.data;
  },

  getStudentInvoices: async (studentId: string): Promise<Invoice[]> => {
    const res = await api.get(`/finance/invoices/student/${studentId}`);
    return res.data;
  },

  recordPayment: async (data: { invoiceId: string; amount: number; method: string; transactionId?: string; proofUrl?: string; notes?: string; branchId: string }): Promise<Payment> => {
    const res = await api.post('/finance/payments', data);
    return res.data;
  },

  verifyPayment: async (paymentId: string, isApproved: boolean): Promise<void> => {
    await api.patch(`/finance/payments/${paymentId}/verify`, { isApproved });
  },

  getExpenseCategories: async (): Promise<ExpenseCategory[]> => {
    const res = await api.get('/finance/expense-categories');
    return res.data;
  },

  createExpenseCategory: async (data: { name: string; description?: string; branchId: string }): Promise<ExpenseCategory> => {
    const res = await api.post('/finance/expense-categories', data);
    return res.data;
  },

  getVouchers: async (skip?: number, take?: number): Promise<Voucher[]> => {
    const res = await api.get('/finance/vouchers', { params: { skip, take } });
    return res.data;
  },

  createVoucher: async (data: { date: string; amount: number; description: string; expenseCategoryId: string; paidTo: string; branchId: string }): Promise<Voucher> => {
    const res = await api.post('/finance/vouchers', data);
    return res.data;
  },

  updateVoucherStatus: async (id: string, status: 'APPROVED' | 'REJECTED'): Promise<Voucher> => {
    const res = await api.patch(`/finance/vouchers/${id}/status`, { status });
    return res.data;
  },

  getCashflow: async (months?: number): Promise<{ month: string; income: number; expenses: number }[]> => {
    const res = await api.get('/finance/cashflow', { params: { months } });
    return res.data;
  },
};
