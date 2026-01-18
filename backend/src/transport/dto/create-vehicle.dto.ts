export class CreateVehicleDto {
    registrationNumber: string;
    model: string;
    capacity: number;
    driverName: string;
    driverPhone?: string;
    branchId: string;
}
