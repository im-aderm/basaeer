import api from "@/lib/api";

export interface SalaryTemplate {
    id: string;
    basicSalary: number;
    allowances?: any;
    deductions?: any;
    netSalary: number;
    staffId: string;
}

export interface PayrollEntry {
    id: string;
    month: number;
    year: number;
    amountPaid: number;
    paymentDate?: string;
    status: 'UNPAID' | 'PAID';
    staffId: string;
    staff?: any;
}

export interface LeaveRequest {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    staffId: string;
    staff?: any;
    createdAt: string;
}

export const HRService = {
    // Salary Template
    upsertSalaryTemplate: async (data: Partial<SalaryTemplate>) => {
        const response = await api.post("/employees/salary-template", data);
        return response.data;
    },

    // Payroll
    generatePayroll: async (month: number, year: number) => {
        const response = await api.post("/employees/payroll/generate", { month, year });
        return response.data;
    },

    getStaffPayrollHistory: async (staffId: string): Promise<PayrollEntry[]> => {
        const response = await api.get(`/employees/${staffId}/payroll-history`);
        return response.data;
    },

    markPayrollAsPaid: async (payrollId: string) => {
        const response = await api.patch(`/employees/payroll/${payrollId}/paid`);
        return response.data;
    },

    // Leaves
    applyLeave: async (data: { type: string; startDate: string; endDate: string; reason: string }) => {
        const response = await api.post("/employees/leave-request", data);
        return response.data;
    },

    getBranchLeaves: async (): Promise<LeaveRequest[]> => {
        const response = await api.get("/employees/leave-requests/branch");
        return response.data;
    },

    updateLeaveStatus: async (id: string, status: 'APPROVED' | 'REJECTED') => {
        const response = await api.patch(`/employees/leave-requests/${id}/status`, { status });
        return response.data;
    },

    // Attendance
    getBranchStaffAttendance: async (date?: string) => {
        const response = await api.get("/employees/attendance/branch", { params: { date } });
        return response.data;
    },

    recordStaffAttendance: async (data: { staffId: string; date: string; status: string; remarks?: string }) => {
        const response = await api.post("/employees/attendance", data);
        return response.data;
    },

    recordBulkStaffAttendance: async (data: { staffIds: string[]; date: string; status: string }) => {
        // POST /employees/attendance/bulk expects { records: [{ staffId, date,
        // status }] }, not { staffIds, date, status } — sending the latter
        // 500'd on every call ("Mark All" in dashboard/hr/attendance).
        const response = await api.post("/employees/attendance/bulk", {
            records: data.staffIds.map((staffId) => ({
                staffId,
                date: data.date,
                status: data.status,
            })),
        });
        return response.data;
    }
};
