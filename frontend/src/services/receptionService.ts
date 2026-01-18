import api from "@/lib/api";

export interface AdmissionEnquiry {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    description?: string;
    date: string;
    nextFollowUpDate?: string;
    source?: string;
    status: string;
}

export interface CallLog {
    id: string;
    name: string;
    phone: string;
    date: string;
    description?: string;
    nextFollowUpDate?: string;
    callType: string;
}

export interface VisitorLog {
    id: string;
    purpose: string;
    name: string;
    phone: string;
    idCard?: string;
    numPerson: number;
    date: string;
    inTime?: string;
    outTime?: string;
    note?: string;
}

export interface Complaint {
    id: string;
    complaintType: string;
    source?: string;
    name: string;
    phone: string;
    date: string;
    description?: string;
    actionTaken?: string;
    assignedTo?: string;
    status: string;
}

export interface PostalRecord {
    id: string;
    fromTitle: string;
    toTitle: string;
    referenceNumber?: string;
    address?: string;
    description?: string;
    date: string;
    type: string;
}

export const ReceptionService = {
    // Enquiries
    getEnquiries: async (branchId: string): Promise<AdmissionEnquiry[]> => {
        const response = await api.get(`/reception/enquiries?branchId=${branchId}`);
        return response.data;
    },
    createEnquiry: async (data: any) => {
        const response = await api.post('/reception/enquiries', data);
        return response.data;
    },

    // Call Logs
    getCallLogs: async (branchId: string): Promise<CallLog[]> => {
        const response = await api.get(`/reception/call-logs?branchId=${branchId}`);
        return response.data;
    },
    createCallLog: async (data: any) => {
        const response = await api.post('/reception/call-logs', data);
        return response.data;
    },

    // Visitor Logs
    getVisitorLogs: async (branchId: string): Promise<VisitorLog[]> => {
        const response = await api.get(`/reception/visitor-logs?branchId=${branchId}`);
        return response.data;
    },
    createVisitorLog: async (data: any) => {
        const response = await api.post('/reception/visitor-logs', data);
        return response.data;
    },

    // Complaints
    getComplaints: async (branchId: string): Promise<Complaint[]> => {
        const response = await api.get(`/reception/complaints?branchId=${branchId}`);
        return response.data;
    },
    createComplaint: async (data: any) => {
        const response = await api.post('/reception/complaints', data);
        return response.data;
    },

    // Postal Records
    getPostalRecords: async (branchId: string): Promise<PostalRecord[]> => {
        const response = await api.get(`/reception/postal-records?branchId=${branchId}`);
        return response.data;
    },
    createPostalRecord: async (data: any) => {
        const response = await api.post('/reception/postal-records', data);
        return response.data;
    }
};
