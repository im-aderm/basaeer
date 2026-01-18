import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateRouteDto } from './dto/create-route.dto';
import { AssignTransportDto } from './dto/assign-transport.dto';

@Injectable()
export class TransportService {
    constructor(private prisma: PrismaService) { }

    async createVehicle(dto: CreateVehicleDto) {
        return this.prisma.vehicle.create({ data: dto });
    }

    async findAllVehicles(branchId: string) {
        return this.prisma.vehicle.findMany({
            where: { branchId },
            include: { assignments: true },
        });
    }

    async createRoute(dto: CreateRouteDto) {
        return this.prisma.transportRoute.create({ data: dto });
    }

    async findAllRoutes(branchId: string) {
        return this.prisma.transportRoute.findMany({
            where: { branchId },
            include: { assignments: true },
        });
    }

    async assignStudent(dto: AssignTransportDto) {
        const { studentId, vehicleId, routeId } = dto;

        return this.prisma.$transaction(async (tx) => {
            // 1. Check vehicle capacity
            const vehicle = await tx.vehicle.findUnique({
                where: { id: vehicleId },
                include: { assignments: true },
            });

            if (!vehicle) throw new NotFoundException('Vehicle not found');
            if (vehicle.assignments.length >= vehicle.capacity) {
                throw new BadRequestException('Vehicle is at full capacity');
            }

            // 2. Check if student already assigned
            const existing = await tx.transportAssignment.findUnique({
                where: { studentId },
            });

            if (existing) {
                throw new ConflictException('Student already assigned to transport');
            }

            // 3. Create assignment
            return tx.transportAssignment.create({
                data: {
                    studentId,
                    vehicleId,
                    routeId,
                },
            });
        });
    }

    async removeAssignment(studentId: string) {
        return this.prisma.transportAssignment.delete({
            where: { studentId },
        });
    }
}
