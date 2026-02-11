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

export const HostelService = {
    getAll: async (): Promise<Hostel[]> => {
        const response = await api.get("/hostels");
        return response.data;
    },

    getById: async (id: string): Promise<Hostel> => {
        const hostels = await HostelService.getAll();
        const hostel = hostels.find((h: Hostel) => h.id === id);
        if (!hostel) throw new Error("Hostel not found");
        return hostel;
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

    releaseBed: async (id: string): Promise<any> => {
        const response = await api.patch(`/hostels/release/${id}`);
        return response.data;
    },

    getVacancies: async (): Promise<any[]> => {
        const response = await api.get("/hostels/vacancies");
        return response.data;
    }
};
