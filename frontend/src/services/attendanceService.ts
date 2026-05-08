import api from "@/lib/api";

export interface Attendance {
    id: string;
    studentId: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    remarks?: string;
    sectionId?: string;
}

export const AttendanceService = {
    mark: async (data: any): Promise<Attendance> => {
        const response = await api.post("/attendance", data);
        return response.data;
    },

    markBulk: async (records: any[]): Promise<any> => {
        const response = await api.post("/attendance/bulk", { records });
        return response.data;
    },

    getBySection: async (sectionId: string, date: string): Promise<any[]> => {
        const response = await api.get(`/attendance/section`, {
            params: { sectionId, date }
        });
        return response.data;
    },

    getStudentAttendance: async (studentId: string): Promise<Attendance[]> => {
        const response = await api.get(`/attendance/student/${studentId}`);
        return response.data;
    },

    // Staff Attendance
    markStaff: async (data: any): Promise<any> => {
        const response = await api.post("/employees/attendance", data);
        return response.data;
    },

    markStaffBulk: async (records: any[]): Promise<any> => {
        const response = await api.post("/employees/attendance/bulk", { records });
        return response.data;
    },

    getStaffByBranch: async (date: string): Promise<any[]> => {
        const response = await api.get(`/employees/attendance/branch`, {
            params: { date }
        });
        return response.data;
    },

    getStaffHistory: async (staffId: string): Promise<any[]> => {
        const response = await api.get(`/employees/${staffId}/attendance`);
        return response.data;
    },

    getStats: async (): Promise<{
        totalStudents: number;
        studentsPresent: number;
        totalStaff: number;
        staffPresent: number;
    }> => {
        const response = await api.get("/attendance/stats");
        return response.data;
    },

    // Session Management
    getActiveSessions: async () => {
        const response = await api.get("/attendance/sessions/active");
        return response.data;
    },

    createSession: async (data: any) => {
        const response = await api.post("/attendance/sessions", data);
        return response.data;
    },

    getSessionDetails: async (id: string) => {
        const response = await api.get(`/attendance/sessions/${id}`);
        return response.data;
    },

    closeSession: async (id: string) => {
        const response = await api.patch(`/attendance/sessions/${id}/close`);
        return response.data;
    },

    lockSession: async (id: string) => {
        const response = await api.post(`/attendance/sessions/${id}/lock`);
        return response.data;
    },

    // QR Scanning
    processQR: async (payload: string, sessionId: string) => {
        const response = await api.post("/attendance/scan", { payload, sessionId });
        return response.data;
    },

    bulkSyncScans: async (scans: any[]) => {
        const response = await api.post("/attendance/scan/bulk", { scans });
        return response.data;
    },

    // Analytics
    getTrends: async (days: number = 30) => {
        const response = await api.get("/attendance/analytics/trends", { params: { days } });
        return response.data;
    },

    getChronicAbsentees: async (threshold: number = 20) => {
        const response = await api.get("/attendance/analytics/chronic", { params: { threshold } });
        return response.data;
    },

    // Student QR Generation
    getStudentQR: async (studentId: string) => {
        const response = await api.get(`/attendance/qr/${studentId}`);
        return response.data;
    },

    bulkGenerateQR: async (studentIds: string[]) => {
        const response = await api.post("/attendance/qr/bulk", { studentIds });
        return response.data;
    }
};
