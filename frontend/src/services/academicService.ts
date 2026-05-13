import api from "@/lib/api";

export const AcademicService = {
    // Exams
    listExams: () => api.get('/exams').then((res) => res.data),
    createExam: (data: any) => api.post('/exams', data).then((res) => res.data),
    examById: (id: string) => api.get(`/exams/management/${id}`).then((res) => res.data),

    // Components
    listComponents: () => api.get('/exams/components').then((res) => res.data),
    createComponent: (data: any) => api.post('/exams/components', data).then((res) => res.data),

    // Approvals
    approvals: () => api.get('/exams/approvals').then((res) => res.data),
    submitApproval: (data: any) => api.post('/exams/approvals', data).then((res) => res.data),

    // Publication
    publish: (data: any) => api.post('/exams/publication', data).then((res) => res.data),

    // Transcripts
    transcripts: () => api.get('/exams/transcripts').then((res) => res.data),
    generateTranscript: (studentId: string) => api.post(`/exams/transcripts/${studentId}`).then((res) => res.data),

    // Tahfeez
    assessTahfeez: (data: any) => api.post('/exams/tahfeez/assessments', data).then((res) => res.data),
    updateTahfeezProgress: (data: any) => api.post('/exams/tahfeez/progress', data).then((res) => res.data),
    tahfeezReport: (studentId: string) => api.get(`/exams/tahfeez/reports/${studentId}`).then((res) => res.data),

    // Portal
    portalResult: (studentId: string, sessionId: string, term: string) => api.get(`/exams/portal/results/${studentId}/${sessionId}/${term}`).then((res) => res.data),
    portalPerformance: (studentId: string) => api.get(`/exams/portal/performance/${studentId}`).then((res) => res.data),

    // Assessments (Dynamic)
    listAssessmentComponents: (params?: { classId?: string; subjectId?: string }) => 
        api.get('/academics/assessments/components', { params }).then((res) => res.data),
    
    createAssessmentComponent: (data: any) => 
        api.post('/academics/assessments/components', data).then((res) => res.data),

    updateAssessmentComponent: (id: string, data: any) =>
        api.patch(`/academics/assessments/components/${id}`, data).then((res) => res.data),

    deleteAssessmentComponent: (id: string) =>
        api.delete(`/academics/assessments/components/${id}`).then((res) => res.data),
    
    recordBulkMarks: (data: any) => 
        api.post('/academics/assessments/bulk-marks', data).then((res) => res.data),
    
    getRecordScores: (recordId: string) =>
        api.get(`/academics/assessments/records/${recordId}/scores`).then((res) => res.data),

    updateScore: (scoreId: string, score: number) =>
        api.patch(`/academics/assessments/scores/${scoreId}`, { score }).then((res) => res.data),

    deleteScore: (scoreId: string) =>
        api.delete(`/academics/assessments/scores/${scoreId}`).then((res) => res.data),

    getOpenDayPerformance: (studentId: string, sessionId: string, term: string) => 
        api.get(`/academics/assessments/open-day/${studentId}`, { params: { sessionId, term } }).then((res) => res.data),

    // Computations
    computeSection: async (data: { sectionId: string; sessionId: string; term: string }): Promise<{ jobId: string }> => {
        const response = await api.post('/academics/compute-section', data);
        return response.data;
    },

    getComputeStatus: async (jobId: string): Promise<any> => {
        const response = await api.get(`/academics/compute-status/${jobId}`);
        return response.data;
    },

    promoteStudents: async (data: { studentIds: string[]; targetClassId: string; targetSectionId: string }): Promise<any> => {
        const response = await api.post('/academics/promote', data);
        return response.data;
    },

    getSchedules: async (params: { classId?: string; sectionId?: string; teacherId?: string }): Promise<any> => {
        const response = await api.get('/academics/schedules', { params });
        return response.data;
    },

    createSchedule: async (data: any): Promise<any> => {
        const response = await api.post('/academics/schedules', data);
        return response.data;
    },

    deleteSchedule: async (id: string): Promise<any> => {
        const response = await api.delete(`/academics/schedules/${id}`);
        return response.data;
    },

    analytics: async (params: { sessionId: string; term: string }): Promise<any> => {
        const response = await api.get('/exams/analytics', { params });
        return response.data;
    },

    verifyTranscript: async (code: string): Promise<any> => {
        const response = await api.get(`/exams/verify/transcript/${code}`);
        return response.data;
    },
};
