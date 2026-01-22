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
    updateEnquiry: async (id: string, data: any) => {
        const response = await api.post(`/reception/enquiries/${id}`, data);
        return response.data;
    },
    deleteEnquiry: async (id: string) => {
        const response = await api.delete(`/reception/enquiries/${id}`);
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
    updateCallLog: async (id: string, data: any) => {
        const response = await api.post(`/reception/call-logs/${id}`, data);
        return response.data;
    },
    deleteCallLog: async (id: string) => {
        const response = await api.delete(`/reception/call-logs/${id}`);
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
    updateVisitorLog: async (id: string, data: any) => {
        const response = await api.post(`/reception/visitor-logs/${id}`, data);
        return response.data;
    },
    deleteVisitorLog: async (id: string) => {
        const response = await api.delete(`/reception/visitor-logs/${id}`);
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
    updateComplaint: async (id: string, data: any) => {
        const response = await api.post(`/reception/complaints/${id}`, data);
        return response.data;
    },
    deleteComplaint: async (id: string) => {
        const response = await api.delete(`/reception/complaints/${id}`);
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
    },
    updatePostalRecord: async (id: string, data: any) => {
        const response = await api.post(`/reception/postal-records/${id}`, data);
        return response.data;
    },
    deletePostalRecord: async (id: string) => {
        const response = await api.delete(`/reception/postal-records/${id}`);
        return response.data;
    }
};
