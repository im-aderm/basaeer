import api from "@/lib/api";

export interface Hostel {
    id: string;
    name: string;
    type: 'BOYS' | 'GIRLS' | 'COED';
    address?: string;
    branchId: string;
    rooms?: Room[];
}

export interface Room {
    id: string;
    number: string;
    floor: number;
    capacity: number;
    hostelId: string;
    beds?: Bed[];
}

export interface Bed {
    id: string;
    name: string;
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
    roomId: string;
    allocations?: Allocation[];
}

export interface Allocation {
    id: string;
    studentId: string;
    bedId: string;
    checkInDate: string;
    checkOutDate?: string;
    isActive: boolean;
    student?: any;
    bed?: Bed & { room?: Room & { hostel?: Hostel } };
}

export interface HostelLeave {
    id: string;
    studentId: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    student?: any;
}

export interface MaintenanceRequest {
    id: string;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    hostelId: string;
    roomId?: string;
    hostel?: Hostel;
}

export const HostelService = {
    getAll: async (): Promise<Hostel[]> => {
        const response = await api.get("/hostels");
        return response.data;
    },

    getById: async (id: string): Promise<Hostel> => {
        const response = await api.get(`/hostels/${id}`);
        return response.data;
    },

    getStats: async (): Promise<any> => {
        const response = await api.get("/hostels/stats");
        return response.data;
    },

    createHostel: async (data: any): Promise<Hostel> => {
        const response = await api.post("/hostels", data);
        return response.data;
    },

    updateHostel: async (id: string, data: any): Promise<Hostel> => {
        const response = await api.patch(`/hostels/${id}`, data);
        return response.data;
    },

    deleteHostel: async (id: string): Promise<any> => {
        const response = await api.delete(`/hostels/${id}`);
        return response.data;
    },

    createRoom: async (data: any): Promise<Room> => {
        const response = await api.post("/hostels/rooms", data);
        return response.data;
    },

    updateRoom: async (id: string, data: any): Promise<Room> => {
        const response = await api.patch(`/hostels/rooms/${id}`, data);
        return response.data;
    },

    deleteRoom: async (id: string): Promise<any> => {
        const response = await api.delete(`/hostels/rooms/${id}`);
        return response.data;
    },

    allocateBed: async (data: any): Promise<Allocation> => {
        const response = await api.post("/hostels/allocate", data);
        return response.data;
    },

    releaseBed: async (allocationId: string): Promise<any> => {
        const response = await api.post(`/hostels/release/${allocationId}`);
        return response.data;
    },

    getVacancies: async (): Promise<any[]> => {
        const response = await api.get("/hostels/vacancies");
        return response.data;
    },

    // Leaves
    createLeave: async (data: any): Promise<HostelLeave> => {
        const response = await api.post("/hostels/leave", data);
        return response.data;
    },

    getLeaves: async (): Promise<HostelLeave[]> => {
        const response = await api.get("/hostels/leaves/branch");
        return response.data;
    },

    getMyLeaves: async (): Promise<HostelLeave[]> => {
        const response = await api.get("/hostels/leaves/mine");
        return response.data;
    },

    updateLeaveStatus: async (id: string, status: string): Promise<HostelLeave> => {
        const response = await api.patch(`/hostels/leaves/${id}/status`, { status });
        return response.data;
    },

    // Maintenance
    createMaintenance: async (data: any): Promise<MaintenanceRequest> => {
        const response = await api.post("/hostels/maintenance", data);
        return response.data;
    },

    getMaintenanceRequests: async (): Promise<MaintenanceRequest[]> => {
        const response = await api.get("/hostels/maintenance/branch");
        return response.data;
    },

    getMyMaintenanceRequests: async (): Promise<MaintenanceRequest[]> => {
        const response = await api.get("/hostels/maintenance/mine");
        return response.data;
    },

    updateMaintenanceStatus: async (id: string, status: string): Promise<MaintenanceRequest> => {
        const response = await api.patch(`/hostels/maintenance/${id}/status`, { status });
        return response.data;
    },

    getMyHostelDetails: async (): Promise<{
        hostelId: string;
        hostelName: string;
        hostelType: string;
        roomId: string;
        roomNumber: string;
        bedName: string;
        checkInDate: string;
    } | null> => {
        const response = await api.get("/hostels/me");
        return response.data;
    }
};