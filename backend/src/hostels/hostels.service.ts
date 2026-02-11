import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { AllocateBedDto } from './dto/allocate-bed.dto';
import { BedStatus } from '../generated/client/client';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class HostelsService {
    constructor(private prisma: PrismaService) { }

    async findHostel(id: string, branchId: string) {
        const hostel = await this.prisma.hostel.findFirst({
            where: { id, branchId }
        });
        if (!hostel) throw new NotFoundException('Hostel not found');
        return hostel;
    }

    async findRoom(id: string, branchId: string) {
        const room = await this.prisma.room.findFirst({
            where: { id, hostel: { branchId } }
        });
        if (!room) throw new NotFoundException('Room not found');
        return room;
    }

    async createHostel(dto: CreateHostelDto, branchId: string) {
        return this.prisma.hostel.create({
            data: { ...dto, branchId },
        });
    }

    async updateHostel(id: string, dto: UpdateHostelDto, branchId: string) {
        await this.findHostel(id, branchId);
        return this.prisma.hostel.update({
            where: { id },
            data: dto
        });
    }

    async deleteHostel(id: string, branchId: string) {
        await this.findHostel(id, branchId);
        return this.prisma.hostel.delete({
            where: { id }
        });
    }

    async findAll(branchId: string | null) {
        return this.prisma.hostel.findMany({
            where: { ...(branchId && { branchId }) },
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

    async createRoom(dto: CreateRoomDto, branchId: string) {
        const { number, floor, capacity, hostelId } = dto;
        await this.findHostel(hostelId, branchId);

        return this.prisma.$transaction(async (tx) => {
            const room = await tx.room.create({
                data: {
                    number,
                    floor,
                    capacity,
                    hostelId,
                },
            });

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

    async updateRoom(id: string, dto: UpdateRoomDto, branchId: string) {
        await this.findRoom(id, branchId);

        return this.prisma.room.update({
            where: { id },
            data: dto
        });
    }

    async deleteRoom(id: string, branchId: string) {
        await this.findRoom(id, branchId);
        return this.prisma.room.delete({
            where: { id }
        });
    }

    async allocateBed(dto: AllocateBedDto, branchId: string) {
        const { studentId, bedId, checkInDate } = dto;

        return this.prisma.$transaction(async (tx) => {
            const bed = await tx.bed.findFirst({
                where: { id: bedId, room: { hostel: { branchId } } },
            });

            if (!bed) throw new NotFoundException('Bed not found in this branch');
            if (bed.status !== BedStatus.AVAILABLE) {
                throw new ConflictException('Bed is not available');
            }

            const student = await tx.student.findFirst({
                where: { id: studentId, branchId }
            });
            if (!student) throw new NotFoundException('Student not found in this branch');

            await tx.bed.update({
                where: { id: bedId },
                data: { status: BedStatus.OCCUPIED },
            });

            return tx.hostelAllocation.create({
                data: {
                    studentId,
                    bedId,
                    checkInDate: new Date(checkInDate),
                },
            });
        });
    }

    async releaseBed(allocationId: string, branchId: string) {
        return this.prisma.$transaction(async (tx) => {
            const allocation = await tx.hostelAllocation.findFirst({
                where: { id: allocationId, student: { branchId } },
            });

            if (!allocation) throw new NotFoundException('Allocation not found in this branch');

            await tx.hostelAllocation.update({
                where: { id: allocationId },
                data: {
                    isActive: false,
                    checkOutDate: new Date(),
                },
            });

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

    async getStats(branchId: string) {
        const hostelsCount = await this.prisma.hostel.count({ where: { branchId } });
        const roomsCount = await this.prisma.room.count({ where: { hostel: { branchId } } });
        const totalBeds = await this.prisma.bed.count({ where: { room: { hostel: { branchId } } } });
        const occupiedBeds = await this.prisma.bed.count({
            where: {
                room: { hostel: { branchId } },
                status: BedStatus.OCCUPIED
            }
        });
        const maintenanceBeds = await this.prisma.bed.count({
            where: {
                room: { hostel: { branchId } },
                status: BedStatus.MAINTENANCE
            }
        });

        return {
            hostels: hostelsCount,
            rooms: roomsCount,
            capacity: totalBeds,
            occupied: occupiedBeds,
            maintenance: maintenanceBeds
        };
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
