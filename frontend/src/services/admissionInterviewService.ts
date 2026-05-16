import api from "@/lib/api";

export interface AdmissionInterview {
    id: string;
    admissionId: string;
    branchId: string;
    interviewDate: string;
    venue?: string;
    interviewerName?: string;
    interviewerId?: string;
    notes?: string;
    outcome?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    admission?: {
        id: string;
        firstName: string;
        lastName: string;
        gender: string;
        guardianEmail?: string;
        guardianPhone?: string;
        desiredClass?: { id: string; name: string };
        desiredSection?: { id: string; name: string };
        status: string;
    };
    branch?: { id: string; name: string };
}

export const AdmissionInterviewService = {
    getAll: async (params?: { status?: string; dateFrom?: string; dateTo?: string }): Promise<AdmissionInterview[]> => {
        const response = await api.get("/admission-interviews", { params });
        return response.data;
    },

    getById: async (id: string): Promise<AdmissionInterview> => {
        const response = await api.get(`/admission-interviews/${id}`);
        return response.data;
    },

    create: async (data: {
        admissionId: string;
        branchId: string;
        interviewDate: string;
        venue?: string;
        interviewerName?: string;
        interviewerId?: string;
        notes?: string;
    }): Promise<AdmissionInterview> => {
        const response = await api.post("/admission-interviews", data);
        return response.data;
    },

    update: async (id: string, data: Partial<AdmissionInterview>): Promise<AdmissionInterview> => {
        const response = await api.patch(`/admission-interviews/${id}`, data);
        return response.data;
    },

    complete: async (id: string, data: { outcome?: string; notes?: string }): Promise<AdmissionInterview> => {
        const response = await api.post(`/admission-interviews/${id}/complete`, data);
        return response.data;
    },

    bulkSchedule: async (data: {
        admissionIds: string[];
        interviewDate: string;
        venue?: string;
        interviewerName?: string;
    }): Promise<{ success: number; failed: number; details: string[] }> => {
        const response = await api.post("/admission-interviews/bulk-schedule", data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/admission-interviews/${id}`);
    },
};
