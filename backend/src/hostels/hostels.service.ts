import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { AllocateBedDto } from './dto/allocate-bed.dto';
import { BedStatus } from '../generated/client/client';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class HostelsService {
    constructor(private prisma: PrismaService) { }

    async findHostel(id: string, context: TenantContext) {
        const hostel = await this.prisma.hostel.findFirst({
            where: TenantHelper.applyIsolation({ id }, context)
        });
        if (!hostel) throw new NotFoundException('Hostel not found');
        return hostel;
    }

    async findRoom(id: string, context: TenantContext) {
        const room = await this.prisma.room.findFirst({
            where: TenantHelper.applyNestedIsolation({ id }, 'hostel', context)
        });
        if (!room) throw new NotFoundException('Room not found');
        return room;
    }

    async createHostel(dto: CreateHostelDto, context: TenantContext) {
        const branchId = dto.branchId || context.branchId;
        if (!branchId) throw new ForbiddenException('Branch context required');
        
        return this.prisma.hostel.create({
            data: { ...dto, branchId },
        });
    }

    async updateHostel(id: string, dto: UpdateHostelDto, context: TenantContext) {
        await this.findHostel(id, context);
        return this.prisma.hostel.update({
            where: { id },
            data: dto
        });
    }

    async deleteHostel(id: string, context: TenantContext) {
        await this.findHostel(id, context);
        return this.prisma.hostel.delete({
            where: { id }
        });
    }

    async findAll(context: TenantContext) {
        return this.prisma.hostel.findMany({
            where: TenantHelper.applyIsolation({}, context),
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

    async createRoom(dto: CreateRoomDto, context: TenantContext) {
        const { number, floor, capacity, hostelId } = dto;
        await this.findHostel(hostelId, context);

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
                name: `Bed ${i + 1}`,
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

    async updateRoom(id: string, dto: UpdateRoomDto, context: TenantContext) {
        return this.prisma.$transaction(async (tx) => {
            const room = await tx.room.findFirst({
                where: TenantHelper.applyNestedIsolation({ id }, 'hostel', context),
                include: { beds: true }
            });

            if (!room) throw new NotFoundException('Room not found');

            // If capacity is changing
            if (dto.capacity && dto.capacity !== room.capacity) {
                const currentCapacity = room.capacity;
                const newCapacity = dto.capacity;

                if (newCapacity < currentCapacity) {
                    const occupiedBedsCount = await tx.bed.count({
                        where: { roomId: id, status: BedStatus.OCCUPIED }
                    });

                    if (occupiedBedsCount > newCapacity) {
                        throw new BadRequestException(`Cannot reduce capacity to ${newCapacity}. ${occupiedBedsCount} beds are currently occupied.`);
                    }

                    const bedsToRemove = await tx.bed.findMany({
                        where: { roomId: id, status: BedStatus.AVAILABLE },
                        orderBy: { name: 'desc' }, 
                        take: currentCapacity - newCapacity
                    });

                    if (bedsToRemove.length < (currentCapacity - newCapacity)) {
                        throw new BadRequestException(`Cannot reduce capacity. Could not find enough available beds to remove.`);
                    }

                    await tx.bed.deleteMany({
                        where: {
                            id: { in: bedsToRemove.map(b => b.id) }
                        }
                    });

                } else if (newCapacity > currentCapacity) {
                    const bedsToAddCount = newCapacity - currentCapacity;
                    let nextBedNum = 1;
                    if (room.beds.length > 0) {
                        const existingNums = room.beds.map(b => {
                            const match = b.name.match(/Bed (\d+)/);
                            return match ? parseInt(match[1]) : 0;
                        });
                        nextBedNum = Math.max(...existingNums) + 1;
                    }

                    const newBeds = Array.from({ length: bedsToAddCount }, (_, i) => ({
                        name: `Bed ${nextBedNum + i}`,
                        roomId: id,
                        status: BedStatus.AVAILABLE
                    }));

                    await tx.bed.createMany({
                        data: newBeds
                    });
                }
            }

            return tx.room.update({
                where: { id },
                data: dto
            });
        });
    }

    async deleteRoom(id: string, context: TenantContext) {
        await this.findRoom(id, context);
        return this.prisma.room.delete({
            where: { id }
        });
    }

    async allocateBed(dto: AllocateBedDto, context: TenantContext) {
        const { studentId, bedId, checkInDate } = dto;

        return this.prisma.$transaction(async (tx) => {
            const bed = await tx.bed.findFirst({
                where: TenantHelper.applyNestedIsolation({ id: bedId }, 'room', context),
            });

            if (!bed) throw new NotFoundException('Bed not found or access denied');
            if (bed.status !== BedStatus.AVAILABLE) {
                throw new ConflictException('Bed is not available');
            }

            const student = await tx.student.findFirst({
                where: TenantHelper.applyIsolation({ id: studentId }, context)
            });
            if (!student) throw new NotFoundException('Student not found or access denied');

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

    async releaseBed(allocationId: string, context: TenantContext) {
        return this.prisma.$transaction(async (tx) => {
            const allocation = await tx.hostelAllocation.findFirst({
                where: TenantHelper.applyNestedIsolation({ id: allocationId }, 'student', context),
            });

            if (!allocation) throw new NotFoundException('Allocation not found or access denied');

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

    async getVacancies(context: TenantContext) {
        return this.prisma.hostel.findMany({
            where: TenantHelper.applyIsolation({}, context),
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

    async getStats(context: TenantContext) {
        const branchId = context.branchId;
        const whereHostel = TenantHelper.applyIsolation({}, context);
        const whereRoom = TenantHelper.applyNestedIsolation({}, 'hostel', context);
        const whereBed = { room: { hostel: whereHostel } };

        const [hostelsCount, roomsCount, totalBeds, occupiedBeds, maintenanceBeds] = await Promise.all([
            this.prisma.hostel.count({ where: whereHostel }),
            this.prisma.room.count({ where: whereRoom }),
            this.prisma.bed.count({ where: whereBed }),
            this.prisma.bed.count({ where: { ...whereBed, status: BedStatus.OCCUPIED } }),
            this.prisma.bed.count({ where: { ...whereBed, status: BedStatus.MAINTENANCE } })
        ]);

        return {
            hostels: hostelsCount,
            rooms: roomsCount,
            capacity: totalBeds,
            occupied: occupiedBeds,
            maintenance: maintenanceBeds
        };
    }

    async createLeave(dto: any, context: TenantContext) {
        if (context.role === 'STUDENT') {
            const student = await this.prisma.student.findUnique({ where: { userId: context.userId } });
            if (!student) throw new NotFoundException('Student profile not found');
            dto.studentId = student.id;
        }

        return this.prisma.hostelLeave.create({
            data: {
                ...dto,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate)
            },
        });
    }

    async getLeaves(context: TenantContext) {
        if (context.role === 'STUDENT') {
            const student = await this.prisma.student.findUnique({ where: { userId: context.userId } });
            if (!student) return [];
            return this.prisma.hostelLeave.findMany({
                where: { studentId: student.id },
                include: { student: true },
                orderBy: { createdAt: 'desc' }
            });
        }

        return this.prisma.hostelLeave.findMany({
            where: TenantHelper.applyNestedIsolation({}, 'student', context),
            include: { student: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateLeaveStatus(id: string, status: string, context: TenantContext) {
        const leave = await this.prisma.hostelLeave.findFirst({
            where: TenantHelper.applyNestedIsolation({ id }, 'student', context)
        });

        if (!leave) throw new NotFoundException('Leave request not found');

        return this.prisma.hostelLeave.update({
            where: { id },
            data: { status }
        });
    }

    async createMaintenanceRequest(dto: any, context: TenantContext) {
        if (context.role === 'STUDENT') {
            const student = await this.prisma.student.findUnique({ where: { userId: context.userId } });
            if (student) {
                const allocation = await this.prisma.hostelAllocation.findFirst({
                    where: { studentId: student.id, isActive: true },
                    include: { bed: true }
                });

                if (allocation) {
                    dto.bedId = allocation.bedId;
                    dto.roomId = allocation.bed.roomId;
                }
            }
        }

        return this.prisma.maintenanceRequest.create({
            data: dto,
        });
    }

    async getMaintenanceRequests(context: TenantContext) {
        if (context.role === 'STUDENT') {
            const student = await this.prisma.student.findUnique({ where: { userId: context.userId } });
            if (!student) return [];

            const allocation = await this.prisma.hostelAllocation.findFirst({
                where: { studentId: student.id, isActive: true },
                include: { bed: true }
            });

            if (!allocation) return [];

            return this.prisma.maintenanceRequest.findMany({
                where: {
                    OR: [
                        { bedId: allocation.bedId },
                        { roomId: allocation.bed.roomId }
                    ]
                },
                include: { bed: { include: { room: true } } },
                orderBy: { createdAt: 'desc' }
            });
        }

        return this.prisma.maintenanceRequest.findMany({
            where: {
                OR: [
                    { bed: { room: { hostel: TenantHelper.applyIsolation({}, context) } } },
                    { roomId: { in: (await this.prisma.room.findMany({ where: TenantHelper.applyNestedIsolation({}, 'hostel', context), select: { id: true } })).map(r => r.id) } }
                ]
            },
            include: {
                bed: {
                    include: { room: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateMaintenanceStatus(id: string, status: string, context: TenantContext) {
        const request = await this.prisma.maintenanceRequest.findUnique({
            where: { id }
        });

        if (!request) throw new NotFoundException('Maintenance request not found');

        return this.prisma.maintenanceRequest.update({
            where: { id },
            data: { status }
        });
    }

    async getMyHostelDetails(context: TenantContext) {
        const student = await this.prisma.student.findUnique({ where: { userId: context.userId } });
        if (!student) throw new NotFoundException('Student profile not found');

        const allocation = await this.prisma.hostelAllocation.findFirst({
            where: { studentId: student.id, isActive: true },
            include: {
                bed: {
                    include: {
                        room: {
                            include: {
                                hostel: true
                            }
                        }
                    }
                }
            }
        });

        if (!allocation) return null;

        return {
            hostelName: allocation.bed.room.hostel.name,
            hostelType: allocation.bed.room.hostel.type,
            roomNumber: allocation.bed.room.number,
            bedName: allocation.bed.name,
            checkInDate: allocation.checkInDate,
        };
    }
}
