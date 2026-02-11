import api from "@/lib/api";

export enum QuestionType {
    MCQ = 'MCQ',
    TRUE_FALSE = 'TRUE_FALSE',
    DESCRIPTIVE = 'DESCRIPTIVE'
}

export enum ExamStatus {
    PUBLISHED = 'PUBLISHED',
    UPCOMING = 'UPCOMING',
    LIVE = 'LIVE',
    ENDED = 'ENDED'
}

export interface QuestionGroup {
    id: string;
    name: string;
    _count?: { questions: number };
}

export interface QuestionOption {
    id: string;
    content: string;
    isCorrect?: boolean;
}

export interface Question {
    id: string;
    type: QuestionType;
    content: string;
    marks: number;
    options: QuestionOption[];
}

export interface OnlineExam {
    id: string;
    title: string;
    description?: string;
    scheduledDate: string;
    durationMinutes: number;
    passPercentage: number;
    status: ExamStatus;
    classId: string;
    subjectId: string;
    groupId: string;
    subject?: { name: string };
    class?: { name: string };
    group?: { name: string; _count?: { questions: number } };
}

export const OnlineExamService = {
    // Question Groups
    getGroups: async (): Promise<QuestionGroup[]> => {
        const response = await api.get('/online-exams/groups');
        return response.data;
    },

    createGroup: async (name: string, branchId: string): Promise<QuestionGroup> => {
        const response = await api.post('/online-exams/groups', { name, branchId });
        return response.data;
    },

    // Questions
    getQuestions: async (groupId: string): Promise<Question[]> => {
        const response = await api.get(`/online-exams/groups/${groupId}/questions`);
        return response.data;
    },

    updateQuestion: async (id: string, data: any): Promise<Question> => {
        const response = await api.patch(`/online-exams/questions/${id}`, data);
        return response.data;
    },

    deleteQuestion: async (id: string): Promise<void> => {
        await api.delete(`/online-exams/questions/${id}`);
    },

    createQuestion: async (data: Partial<Question> & { groupId: string }): Promise<Question> => {
        const response = await api.post('/online-exams/questions', data);
        return response.data;
    },

    // Exams
    getExams: async (filters?: { classId?: string; subjectId?: string }): Promise<OnlineExam[]> => {
        const response = await api.get('/online-exams', { params: filters });
        return response.data;
    },

    createExam: async (data: any): Promise<OnlineExam> => {
        const response = await api.post('/online-exams', data);
        return response.data;
    },

    // Student Actions
    startExam: async (examId: string): Promise<OnlineExam & {
        group: { questions: Question[] },
        attempt: { startTime: string; answers: any[] }
    }> => {
        const response = await api.get(`/online-exams/${examId}/start`);
        return response.data;
    },

    submitAttempt: async (examId: string, answers: any[]): Promise<any> => {
        const response = await api.post('/online-exams/submit', { examId, answers });
        return response.data;
    },

    syncAnswers: async (examId: string, answers: any[]): Promise<any> => {
        const response = await api.post('/online-exams/sync', { examId, answers });
        return response.data;
    },

    // Grading
    getAttempts: async (examId: string): Promise<any[]> => {
        const response = await api.get(`/online-exams/${examId}/attempts`);
        return response.data;
    },

    gradeAnswer: async (attemptId: string, questionId: string, marksAwarded: number): Promise<any> => {
        const response = await api.patch(`/online-exams/attempts/${attemptId}/questions/${questionId}/grade`, { marksAwarded });
        return response.data;
    },

    generatePositions: async (examId: string): Promise<any> => {
        const response = await api.post(`/online-exams/${examId}/generate-positions`);
        return response.data;
    }
};
