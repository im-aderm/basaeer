import api from "@/lib/api";

export interface CheckerResultRow {
    sessionName: string;
    term: string;
    average: string | null;
    finalGrade: string | null;
    classPosition: string | null;
    code: string;
}

export interface CheckerResponse {
    found: boolean;
    message?: string;
    studentName?: string;
    className?: string;
    results?: CheckerResultRow[];
}

export interface VerifyCodeResponse {
    valid: boolean;
    reason?: string;
    studentName?: string;
    className?: string;
    sectionName?: string;
    sessionName?: string;
    term?: string;
    average?: string | null;
    finalGrade?: string | null;
    classPosition?: string | null;
    publishedAt?: string;
}

export const ResultCheckerService = {
    checkByAdmissionNumber: async (admissionNumber: string, dob: string): Promise<CheckerResponse> => {
        const response = await api.post("/exams/portal/checker", { admissionNumber, dob });
        return response.data;
    },

    verifyCode: async (code: string): Promise<VerifyCodeResponse> => {
        const response = await api.get(`/exams/verify/result/${code}`);
        return response.data;
    },

    downloadPdf: async (code: string): Promise<Blob> => {
        const response = await api.get(`/exams/portal/checker/${code}/pdf`, {
            responseType: "blob",
        });
        return response.data;
    },
};
