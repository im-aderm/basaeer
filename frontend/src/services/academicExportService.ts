import api from "@/lib/api";

export enum ExportStatus {
    QUEUED = 'QUEUED',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
}

export interface AcademicExport {
    id: string;
    type: string;
    status: ExportStatus;
    progress: number;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    error?: string;
    createdAt: string;
    expiresAt?: string;
}

export const academicExportService = {
    startExport: async (type: string, parameters: any = {}): Promise<{ exportId: string }> => {
        const response = await api.post("/academics/exports", { type, parameters });
        return response.data;
    },

    getExports: async (): Promise<AcademicExport[]> => {
        const response = await api.get("/academics/exports");
        return response.data;
    },

    getExportStatus: async (id: string): Promise<AcademicExport> => {
        const response = await api.get(`/academics/exports/${id}`);
        return response.data;
    },

    deleteExport: async (id: string): Promise<void> => {
        await api.delete(`/academics/exports/${id}`);
    },
};
