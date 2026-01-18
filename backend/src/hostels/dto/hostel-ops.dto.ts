export class CreateHostelLeaveDto {
    startDate: string;
    endDate: string;
    reason: string;
    studentId: string;
}

export class CreateMaintenanceRequestDto {
    title: string;
    description: string;
    priority?: string;
    bedId?: string;
    roomId?: string;
}
