import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { AllocateBedDto } from './dto/allocate-bed.dto';
import { BedStatus } from '../generated/client/client';

@Injectable()
export class HostelsService {
    constructor(private prisma: PrismaService) { }

    async createHostel(dto: CreateHostelDto) {
        return this.prisma.hostel.create({
            data: dto,
        });
    }

    async findAll(branchId: string) {
        return this.prisma.hostel.findMany({
            where: { branchId },
            include: {
                rooms: {
                    include: {
                        beds: {
                            include: {
                                allocations: {
                                    where: { isActive: true },
                                    include: {
                                        student: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    async createRoom(dto: CreateRoomDto) {
        const { number, floor, capacity, hostelId } = dto;

        // Transaction to create room and its beds
        return this.prisma.$transaction(async (tx) => {
            const room = await tx.room.create({
                data: {
                    number,
                    floor,
                    capacity,
                    hostelId,
                },
            });

            // Create beds based on capacity
            const bedsData = Array.from({ length: capacity }, (_, i) => ({
                name: `Bed ${String.fromCharCode(65 + i)}`,
                roomId: room.id,
            }));

            await tx.bed.createMany({
                data: bedsData,
            });

            return tx.room.findUnique({
                where: { id: room.id },
                include: { beds: true },
            });
        });
    }

    async allocateBed(dto: AllocateBedDto) {
        const { studentId, bedId, checkInDate } = dto;

        return this.prisma.$transaction(async (tx) => {
            // 1. Check if bed is available
            const bed = await tx.bed.findUnique({
                where: { id: bedId },
            });

            if (!bed) throw new NotFoundException('Bed not found');
            if (bed.status !== BedStatus.AVAILABLE) {
                throw new ConflictException('Bed is not available');
            }

            // 2. Mark bed as occupied
            await tx.bed.update({
                where: { id: bedId },
                data: { status: BedStatus.OCCUPIED },
            });

            // 3. Create allocation
            return tx.hostelAllocation.create({
                data: {
                    studentId,
                    bedId,
                    checkInDate: new Date(checkInDate),
                },
            });
        });
    }

    async releaseBed(allocationId: string) {
        return this.prisma.$transaction(async (tx) => {
            const allocation = await tx.hostelAllocation.findUnique({
                where: { id: allocationId },
            });

            if (!allocation) throw new NotFoundException('Allocation not found');

            // 1. Mark allocation as inactive
            await tx.hostelAllocation.update({
                where: { id: allocationId },
                data: {
                    isActive: false,
                    checkOutDate: new Date(),
                },
            });

            // 2. Mark bed as available
            await tx.bed.update({
                where: { id: allocation.bedId },
                data: { status: BedStatus.AVAILABLE },
            });

            return { message: 'Bed released successfully' };
        });
    }

    async getVacancies(branchId: string) {
        return this.prisma.hostel.findMany({
            where: { branchId },
            select: {
                id: true,
                name: true,
                rooms: {
                    select: {
                        id: true,
                        number: true,
                        beds: {
                            where: { status: BedStatus.AVAILABLE },
                        },
                    },
                },
            },
        });
    }

    async createLeave(dto: any) {
        return this.prisma.hostelLeave.create({
            data: {
                ...dto,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
            },
        });
    }

    async createMaintenanceRequest(dto: any) {
        return this.prisma.maintenanceRequest.create({
            data: dto,
        });
    }
}
