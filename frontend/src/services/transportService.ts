import api from '@/lib/api';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  capacity: number;
  driverName: string;
  driverPhone?: string;
  branchId: string;
  currentLat?: number;
  currentLng?: number;
  lastPing?: string;
  assignments?: TransportAssignment[];
}

export interface TransportRoute {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  stops?: any;
  branchId: string;
  assignments?: TransportAssignment[];
}

export interface TransportAssignment {
  id: string;
  studentId: string;
  vehicleId: string;
  routeId: string;
  student?: { firstName: string; lastName: string; class?: { name: string } };
  vehicle?: { registrationNumber: string; model: string };
  route?: { name: string; startPoint: string; endPoint: string };
}

export const transportService = {
  getVehicles: async (): Promise<Vehicle[]> => {
    const res = await api.get('/transport/vehicles');
    return res.data;
  },

  getVehicle: async (id: string): Promise<Vehicle> => {
    const res = await api.get(`/transport/vehicles/${id}`);
    return res.data;
  },

  createVehicle: async (data: { registrationNumber: string; model: string; capacity: number; driverName: string; driverPhone?: string; branchId: string }): Promise<Vehicle> => {
    const res = await api.post('/transport/vehicles', data);
    return res.data;
  },

  updateVehicle: async (id: string, data: Partial<{ registrationNumber: string; model: string; capacity: number; driverName: string; driverPhone: string }>): Promise<Vehicle> => {
    const res = await api.patch(`/transport/vehicles/${id}`, data);
    return res.data;
  },

  deleteVehicle: async (id: string): Promise<void> => {
    await api.delete(`/transport/vehicles/${id}`);
  },

  getRoutes: async (): Promise<TransportRoute[]> => {
    const res = await api.get('/transport/routes');
    return res.data;
  },

  getRoute: async (id: string): Promise<TransportRoute> => {
    const res = await api.get(`/transport/routes/${id}`);
    return res.data;
  },

  createRoute: async (data: { name: string; startPoint: string; endPoint: string; stops?: any; branchId: string }): Promise<TransportRoute> => {
    const res = await api.post('/transport/routes', data);
    return res.data;
  },

  updateRoute: async (id: string, data: Partial<{ name: string; startPoint: string; endPoint: string; stops: any }>): Promise<TransportRoute> => {
    const res = await api.patch(`/transport/routes/${id}`, data);
    return res.data;
  },

  deleteRoute: async (id: string): Promise<void> => {
    await api.delete(`/transport/routes/${id}`);
  },

  assignStudent: async (data: { studentId: string; vehicleId: string; routeId: string; branchId: string }): Promise<TransportAssignment> => {
    const res = await api.post('/transport/assign', data);
    return res.data;
  },

  removeAssignment: async (studentId: string): Promise<void> => {
    await api.delete(`/transport/assign/${studentId}`);
  },

  getAssignmentsCount: async (): Promise<{ count: number }> => {
    const res = await api.get('/transport/stats/assignments');
    return res.data;
  },
};
