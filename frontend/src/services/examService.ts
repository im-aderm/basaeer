import api from "@/lib/api";
import { Term, ExamTerm } from "@/types/enums";

export interface GradingScale {
    id?: string;
    name: string;
    minScore: number;
    maxScore: number;
    grade: string;
    remark?: string;
    branchId?: string;
}

export interface AssessmentRecord {
    studentId: string;
    asgn1?: number;
    asgn2?: number;
    test1?: number;
    test2?: number;
    examScore?: number;
}

export const ExamService = {
    // Sessions
    getSessions: async () => {
        const response = await api.get("/exams/sessions");
        return response.data;
    },

    createSession: async (data: any) => {
        const response = await api.post("/exams/sessions", data);
        return response.data;
    },

    // Grading Scales
    getGradingScales: async (branchId?: string) => {
        const response = await api.get("/exams/grading-scales", {
            params: { branchId }
        });
        return response.data;
    },

    createGradingScale: async (data: GradingScale) => {
        const response = await api.post("/exams/grading-scales", data);
        return response.data;
    },

    // Score Entry
    submitScores: async (data: any) => {
        const response = await api.post("/exams/submit-scores", data);
        return response.data;
    },

    // Behavioural
    submitBehavioural: async (data: any) => {
        const response = await api.post("/exams/behavioural", data);
        return response.data;
    },

    // Summarization & Eligibility
    summarizeTerm: async (studentId: string, data: { sessionId: string; term: Term; examTerm: ExamTerm }) => {
        const response = await api.post(`/exams/summarize/${studentId}`, data);
        return response.data;
    },

    // Broadsheet
    getBroadsheet: async (sectionId: string, sessionId: string, term: Term) => {
        const response = await api.get(`/exams/broadsheet/${sectionId}/${sessionId}/${term}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Report Cards
    getReportCard: async (studentId: string, sessionId: string, term: Term) => {
        const response = await api.get(`/exams/report/${studentId}/${sessionId}/${term}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    getAnnualReport: async (studentId: string, sessionId: string) => {
        const response = await api.get(`/exams/report-annual/${studentId}/${sessionId}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    getBatchReports: async (sectionId: string, sessionId: string, term: Term) => {
        const response = await api.get(`/exams/batch-report/${sectionId}/${sessionId}/${term}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Academic portal — student/parent-facing published results
    getMyPublishedResults: async (studentId: string) => {
        const response = await api.get(`/exams/portal/results/${studentId}`);
        return response.data;
    },

    getPublishedResult: async (studentId: string, sessionId: string, term: Term) => {
        const response = await api.get(`/exams/portal/results/${studentId}/${sessionId}/${term}`);
        return response.data;
    },

    getPerformanceTrend: async (studentId: string) => {
        const response = await api.get(`/exams/portal/performance/${studentId}`);
        return response.data;
    },

    downloadReportCard: async (studentId: string, sessionId: string, term: Term) => {
        const response = await api.get(`/exams/report/${studentId}/${sessionId}/${term}`, {
            responseType: 'blob'
        });
        return response.data;
    },
};
