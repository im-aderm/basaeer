import api from "@/lib/api";

export interface AdmissionExam {
    id: string;
    name: string;
    branchId: string;
    academicSessionId?: string;
    examDate: string;
    venue?: string;
    startTime: string;
    endTime: string;
    description?: string;
    status: string;
    maxScore: number;
    createdAt: string;
    updatedAt: string;
    branch?: { id: string; name: string };
    academicSession?: { id: string; name: string };
    _count?: { scores: number };
}

export interface AdmissionExamScore {
    id: string;
    admissionId: string;
    examId: string;
    score: number;
    maxScore: number;
    grade?: string;
    notes?: string;
    gradedById?: string;
    gradedAt?: string;
    admission?: {
        id: string;
        firstName: string;
        lastName: string;
        gender: string;
        desiredClass?: { id: string; name: string };
        desiredSection?: { id: string; name: string };
        status: string;
        guardianEmail?: string;
        guardianPhone?: string;
    };
}

export interface RankedScore extends AdmissionExamScore {
    rank: number;
    percentage: string;
}

export const AdmissionExamService = {
    getAll: async (params?: { status?: string; dateFrom?: string; dateTo?: string }): Promise<AdmissionExam[]> => {
        const response = await api.get("/admission-exams", { params });
        return response.data;
    },

    getById: async (id: string): Promise<AdmissionExam> => {
        const response = await api.get(`/admission-exams/${id}`);
        return response.data;
    },

    create: async (data: {
        name: string;
        branchId: string;
        academicSessionId?: string;
        examDate: string;
        venue?: string;
        startTime: string;
        endTime: string;
        description?: string;
        maxScore?: number;
    }): Promise<AdmissionExam> => {
        const response = await api.post("/admission-exams", data);
        return response.data;
    },

    update: async (id: string, data: Partial<AdmissionExam>): Promise<AdmissionExam> => {
        const response = await api.patch(`/admission-exams/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/admission-exams/${id}`);
    },

    addScore: async (examId: string, data: {
        admissionId: string;
        score: number;
        maxScore?: number;
        grade?: string;
        notes?: string;
    }): Promise<AdmissionExamScore> => {
        const response = await api.post(`/admission-exams/${examId}/scores`, data);
        return response.data;
    },

    bulkAddScores: async (examId: string, scores: Array<{
        admissionId: string;
        score: number;
        maxScore?: number;
        grade?: string;
        notes?: string;
    }>): Promise<{ success: number; failed: number; details: string[] }> => {
        const response = await api.post(`/admission-exams/${examId}/scores/bulk`, { scores });
        return response.data;
    },

    getRankings: async (examId: string): Promise<RankedScore[]> => {
        const response = await api.get(`/admission-exams/${examId}/rankings`);
        return response.data;
    },

    assignAdmissions: async (examId: string, admissionIds: string[]): Promise<any> => {
        const response = await api.post(`/admission-exams/${examId}/assign`, { admissionIds });
        return response.data;
    },
};
