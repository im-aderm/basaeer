import api from "@/lib/api";

export interface InventoryCategory {
    id: string;
    name: string;
}

export interface InventoryStore {
    id: string;
    name: string;
    code?: string;
}

export interface InventorySupplier {
    id: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
}

export interface InventoryUnit {
    id: string;
    name: string;
}

export interface InventoryProduct {
    id: string;
    name: string;
    code?: string;
    description?: string;
    stock: number;
    categoryId: string;
    category?: InventoryCategory;
    unitId: string;
    unit?: InventoryUnit;
    storeId?: string;
    store?: InventoryStore;
    costPrice: number;
    sellingPrice: number;
}

export interface InventoryPurchase {
    id: string;
    voucherNo?: string;
    date: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productId: string;
    product?: InventoryProduct;
    supplierId: string;
    supplier?: InventorySupplier;
    createdAt: string;
}

export interface InventoryIssue {
    id: string;
    date: string;
    returnDate?: string;
    quantity: number;
    status: 'ISSUED' | 'RETURNED';
    productId: string;
    product?: InventoryProduct;
    issuedTo: string;
    staffId?: string;
    staff?: any;
    studentId?: string;
    student?: any;
    createdAt: string;
}

export const InventoryService = {
    // Setup
    getCategories: async (branchId: string): Promise<InventoryCategory[]> => {
        const response = await api.get(`/inventory/categories?branchId=${branchId}`);
        return response.data;
    },
    createCategory: async (data: any) => {
        const response = await api.post('/inventory/categories', data);
        return response.data;
    },
    updateCategory: async (id: string, data: any) => {
        const response = await api.post(`/inventory/categories/${id}`, data);
        return response.data;
    },
    deleteCategory: async (id: string) => {
        const response = await api.delete(`/inventory/categories/${id}`);
        return response.data;
    },

    getStores: async (branchId: string): Promise<InventoryStore[]> => {
        const response = await api.get(`/inventory/stores?branchId=${branchId}`);
        return response.data;
    },
    createStore: async (data: any) => {
        const response = await api.post('/inventory/stores', data);
        return response.data;
    },
    updateStore: async (id: string, data: any) => {
        const response = await api.post(`/inventory/stores/${id}`, data);
        return response.data;
    },
    deleteStore: async (id: string) => {
        const response = await api.delete(`/inventory/stores/${id}`);
        return response.data;
    },

    getSuppliers: async (branchId: string): Promise<InventorySupplier[]> => {
        const response = await api.get(`/inventory/suppliers?branchId=${branchId}`);
        return response.data;
    },
    createSupplier: async (data: any) => {
        const response = await api.post('/inventory/suppliers', data);
        return response.data;
    },
    updateSupplier: async (id: string, data: any) => {
        const response = await api.post(`/inventory/suppliers/${id}`, data);
        return response.data;
    },
    deleteSupplier: async (id: string) => {
        const response = await api.delete(`/inventory/suppliers/${id}`);
        return response.data;
    },

    getUnits: async (branchId: string): Promise<InventoryUnit[]> => {
        const response = await api.get(`/inventory/units?branchId=${branchId}`);
        return response.data;
    },
    createUnit: async (data: any) => {
        const response = await api.post('/inventory/units', data);
        return response.data;
    },
    updateUnit: async (id: string, data: any) => {
        const response = await api.post(`/inventory/units/${id}`, data);
        return response.data;
    },
    deleteUnit: async (id: string) => {
        const response = await api.delete(`/inventory/units/${id}`);
        return response.data;
    },

    // Products
    getProducts: async (branchId: string): Promise<InventoryProduct[]> => {
        const response = await api.get(`/inventory/products?branchId=${branchId}`);
        return response.data;
    },
    createProduct: async (data: any) => {
        const response = await api.post('/inventory/products', data);
        return response.data;
    },
    updateProduct: async (id: string, data: any) => {
        const response = await api.post(`/inventory/products/${id}`, data);
        return response.data;
    },
    deleteProduct: async (id: string) => {
        const response = await api.delete(`/inventory/products/${id}`);
        return response.data;
    },

    // Transactions
    getPurchases: async (branchId: string): Promise<InventoryPurchase[]> => {
        const response = await api.get(`/inventory/purchases?branchId=${branchId}`);
        return response.data;
    },
    createPurchase: async (data: any) => {
        const response = await api.post('/inventory/purchases', data);
        return response.data;
    },

    getIssues: async (branchId: string): Promise<InventoryIssue[]> => {
        const response = await api.get(`/inventory/issues?branchId=${branchId}`);
        return response.data;
    },
    issueItem: async (data: any) => {
        const response = await api.post('/inventory/issue', data);
        return response.data;
    },
    returnItem: async (id: string) => {
        const response = await api.post(`/inventory/issue/return/${id}`);
        return response.data;
    },

    getSales: async (branchId: string): Promise<any[]> => {
        const response = await api.get(`/inventory/sales?branchId=${branchId}`);
        return response.data;
    },
    createSale: async (data: any) => {
        const response = await api.post('/inventory/sales', data);
        return response.data;
    }
};
