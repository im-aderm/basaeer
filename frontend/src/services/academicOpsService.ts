import api from "@/lib/api";

export interface AssignmentDto {
    title: string;
    description?: string;
    dueDate: string;
    classId: string;
    sectionId?: string;
    subjectId: string;
}

export interface AssignmentSubmissionDto {
    assignmentId: string;
    studentId: string;
    content: string;
    attachments?: string[];
}

export const AcademicOpsService = {
    // Assignments (Homework)
    getAssignments: async (): Promise<any[]> => {
        const response = await api.get("/assignments");
        return response.data;
    },

    getAssignmentById: async (id: string): Promise<any> => {
        const response = await api.get(`/assignments/${id}`);
        return response.data;
    },

    createAssignment: async (data: AssignmentDto): Promise<any> => {
        const response = await api.post("/assignments", data);
        return response.data;
    },

    updateAssignment: async (id: string, data: Partial<AssignmentDto>): Promise<any> => {
        const response = await api.put(`/assignments/${id}`, data);
        return response.data;
    },

    deleteAssignment: async (id: string): Promise<void> => {
        await api.delete(`/assignments/${id}`);
    },

    // Assignment Submissions
    getAssignmentSubmissions: async (assignmentId: string): Promise<any[]> => {
        const response = await api.get(`/assignments/${assignmentId}/submissions`);
        return response.data;
    },

    getStudentAssignments: async (studentId: string): Promise<any[]> => {
        const response = await api.get(`/assignments/student/${studentId}`);
        return response.data;
    },

    submitAssignment: async (data: { assignmentId: string; studentId: string; contentUrl: string }): Promise<any> => {
        const response = await api.post("/assignments/submit", data);
        return response.data;
    },

    gradeSubmission: async (submissionId: string, grade: number, feedback?: string): Promise<any> => {
        const response = await api.put(`/assignments/submissions/${submissionId}/grade`, {
            grade,
            feedback,
        });
        return response.data;
    },
};
