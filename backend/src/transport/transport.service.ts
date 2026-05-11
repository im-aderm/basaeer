import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { AssignTransportDto } from './dto/assign-transport.dto';

@Injectable()
export class TransportService {
    constructor(private prisma: PrismaService) { }

    async createVehicle(dto: CreateVehicleDto, branchId: string) {
        return this.prisma.vehicle.create({
            data: { ...dto, branchId }
        });
    }

    async findAllVehicles(branchId: string) {
        return this.prisma.vehicle.findMany({
            where: { branchId },
            include: { assignments: true },
        });
    }

    async findVehicle(id: string, branchId: string) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { id, branchId }
        });
        if (!vehicle) throw new NotFoundException('Vehicle not found');
        return vehicle;
    }

    async updateVehicle(id: string, dto: UpdateVehicleDto, branchId: string) {
        await this.findVehicle(id, branchId);
        return this.prisma.vehicle.update({
            where: { id },
            data: dto
        });
    }

    async deleteVehicle(id: string, branchId: string) {
        await this.findVehicle(id, branchId);
        return this.prisma.vehicle.delete({
            where: { id }
        });
    }

    async createRoute(dto: CreateRouteDto, branchId: string) {
        return this.prisma.transportRoute.create({
            data: { ...dto, branchId }
        });
    }

    async findAllRoutes(branchId: string) {
        return this.prisma.transportRoute.findMany({
            where: { branchId },
            include: { assignments: true },
        });
    }

    async findRoute(id: string, branchId: string) {
        const route = await this.prisma.transportRoute.findFirst({
            where: { id, branchId }
        });
        if (!route) throw new NotFoundException('Route not found');
        return route;
    }

    async updateRoute(id: string, dto: UpdateRouteDto, branchId: string) {
        await this.findRoute(id, branchId);
        return this.prisma.transportRoute.update({
            where: { id },
            data: dto
        });
    }

    async deleteRoute(id: string, branchId: string) {
        await this.findRoute(id, branchId);
        return this.prisma.transportRoute.delete({
            where: { id }
        });
    }

    async assignStudent(dto: AssignTransportDto, branchId: string) {
        const { studentId, vehicleId, routeId } = dto;

        return this.prisma.$transaction(async (tx) => {
            // 1. Verify Student belongs to branch
            const student = await tx.student.findFirst({
                where: { id: studentId, branchId }
            });
            if (!student) throw new NotFoundException('Student not found in this branch');

            // 2. Verify Vehicle belongs to branch and check capacity
            const vehicle = await tx.vehicle.findFirst({
                where: { id: vehicleId, branchId },
                include: { assignments: true },
            });
            if (!vehicle) throw new NotFoundException('Vehicle not found in this branch');
            if (vehicle.assignments.length >= vehicle.capacity) {
                throw new BadRequestException('Vehicle is at full capacity');
            }

            // 3. Verify Route belongs to branch
            const route = await tx.transportRoute.findFirst({
                where: { id: routeId, branchId }
            });
            if (!route) throw new NotFoundException('Route not found in this branch');

            // 4. Check if student already assigned
            const existing = await tx.transportAssignment.findUnique({
                where: { studentId },
            });
            if (existing) {
                throw new ConflictException('Student already assigned to transport');
            }

            // 5. Create assignment
            return tx.transportAssignment.create({
                data: {
                    studentId,
                    vehicleId,
                    routeId,
                },
            });
        });
    }

    async removeAssignment(studentId: string, branchId: string) {
        // Verify student belongs to branch before removing assignment
        const student = await this.prisma.student.findFirst({
            where: { id: studentId, branchId },
            include: { transportAssignment: true }
        });

        if (!student) throw new NotFoundException('Student not found');
        if (!student.transportAssignment) throw new NotFoundException('No transport assignment found for this student');

        return this.prisma.transportAssignment.delete({
            where: { studentId },
        });
    }

    async getAssignmentsCount(branchId: string) {
        return this.prisma.transportAssignment.count({
            where: {
                student: { branchId }
            }
        });
    }

    async updateVehicleLocation(vehicleId: string, lat: number, lng: number, branchId: string) {
        await this.findVehicle(vehicleId, branchId);
        return this.prisma.vehicle.update({
            where: { id: vehicleId },
            data: {
                currentLat: lat,
                currentLng: lng,
                lastPing: new Date(),
            }
        });
    }

    async getVehicleLocation(vehicleId: string, branchId: string) {
        const vehicle = await this.findVehicle(vehicleId, branchId);
        return {
            lat: vehicle.currentLat,
            lng: vehicle.currentLng,
            lastPing: vehicle.lastPing,
        };
    }

    async recordAttendance(studentId: string, assignmentId: string, type: string, status: string, date: Date, branchId: string) {
        // Validate assignment belongs to student and branch
        const assignment = await this.prisma.transportAssignment.findFirst({
            where: {
                id: assignmentId,
                studentId,
                student: { branchId }
            }
        });

        if (!assignment) {
            throw new NotFoundException('Assignment not found or access denied');
        }

        return this.prisma.transportAttendance.create({
            data: {
                studentId,
                assignmentId,
                type,
                status,
                date: new Date(date)
            }
        });
    }

    async getStudentAttendance(studentId: string, branchId: string) {
        return this.prisma.transportAttendance.findMany({
            where: {
                studentId,
                student: { branchId }
            },
            orderBy: { date: 'desc' }
        });
    }
}
