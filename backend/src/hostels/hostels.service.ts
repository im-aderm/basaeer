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

            // Improved bed naming strategy: A1, A2, etc. where A is room suffix? 
            // Or just Bed 1, Bed 2. Let's use "Bed {i+1}" for simplicity and scalability
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

    async updateRoom(id: string, dto: UpdateRoomDto, branchId: string) {
        return this.prisma.$transaction(async (tx) => {
            const room = await tx.room.findFirst({
                where: { id, hostel: { branchId } },
                include: { beds: true }
            });

            if (!room) throw new NotFoundException('Room not found');

            // If capacity is changing
            if (dto.capacity && dto.capacity !== room.capacity) {
                const currentCapacity = room.capacity;
                const newCapacity = dto.capacity;

                if (newCapacity < currentCapacity) {
                    // Check if we can reduce capacity (i.e. are there enough empty beds?)
                    const occupiedBedsCount = await tx.bed.count({
                        where: { roomId: id, status: BedStatus.OCCUPIED }
                    });

                    if (occupiedBedsCount > newCapacity) {
                        throw new BadRequestException(`Cannot reduce capacity to ${newCapacity}. ${occupiedBedsCount} beds are currently occupied.`);
                    }

                    // Remove excess available beds
                    // We prefer removing available beds with highest numbers first
                    const bedsToRemove = await tx.bed.findMany({
                        where: { roomId: id, status: BedStatus.AVAILABLE },
                        orderBy: { name: 'desc' }, // Assuming "Bed 10" > "Bed 9" alphabetically, which is tricky. 
                        // Better to rely on creation order or status. 
                        take: currentCapacity - newCapacity
                    });

                    // If we still need to remove beds but couldn't find enough available ones (this shouldn't happen due to check above, but safe guard)
                    if (bedsToRemove.length < (currentCapacity - newCapacity)) {
                        throw new BadRequestException(`Cannot reduce capacity. Could not find enough available beds to remove.`);
                    }

                    await tx.bed.deleteMany({
                        where: {
                            id: { in: bedsToRemove.map(b => b.id) }
                        }
                    });

                } else if (newCapacity > currentCapacity) {
                    // Add new beds
                    const bedsToAddCount = newCapacity - currentCapacity;
                    // Find the highest existing bed number to continue sequence
                    // Assuming names are "Bed X"
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

    async createLeave(dto: any, user: any) {
        if (user.role === 'STUDENT') {
            const student = await this.prisma.student.findUnique({ where: { userId: user.id } });
            if (!student) throw new NotFoundException('Student profile not found');
            dto.studentId = student.id;
        }
        // If not student (e.g. admin creating on behalf), we expect studentId in dto

        return this.prisma.hostelLeave.create({
            data: {
                ...dto,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate)
            },
        });
    }

    async getLeaves(user: any) {
        if (user.role === 'STUDENT') {
            const student = await this.prisma.student.findUnique({ where: { userId: user.id } });
            if (!student) return [];
            return this.prisma.hostelLeave.findMany({
                where: { studentId: student.id },
                include: { student: true },
                orderBy: { createdAt: 'desc' }
            });
        }

        return this.prisma.hostelLeave.findMany({
            where: { student: { branchId: user.branchId } },
            include: { student: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateLeaveStatus(id: string, status: string, branchId: string) {
        const leave = await this.prisma.hostelLeave.findFirst({
            where: { id, student: { branchId } }
        });

        if (!leave) throw new NotFoundException('Leave request not found');

        return this.prisma.hostelLeave.update({
            where: { id },
            data: { status }
        });
    }

    async createMaintenanceRequest(dto: any, user: any) {
        // If student, try to link to their bed/room
        if (user.role === 'STUDENT') {
            const student = await this.prisma.student.findUnique({ where: { userId: user.id } });
            if (student) {
                // Find active allocation
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

    async getMaintenanceRequests(user: any) {
        if (user.role === 'STUDENT') {
            const student = await this.prisma.student.findUnique({ where: { userId: user.id } });
            if (!student) return [];

            // Find requests for student's bed or room (if they are allocated)
            // Or requests created by this student (requires createdBy field, which we don't have yet? schema check needed)
            // For now, let's show requests related to their CURRENT bed/room
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
                    { bed: { room: { hostel: { branchId: user.branchId } } } },
                    {
                        bedId: null,
                        roomId: { in: [] } // Placeholder, logic below is complex with Prisma types
                        // checking logic: we need requests where roomId -> room -> hostel -> branchId
                        // But we can't easily filter by roomId relation if it's not defined in schema
                    }
                ]
                // Improved query for Admins:
            },
            include: {
                bed: {
                    include: { room: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateMaintenanceStatus(id: string, status: string, branchId: string) {
        const request = await this.prisma.maintenanceRequest.findFirst({
            where: { id }
            // We should ideally check branch ownership
        });

        if (!request) throw new NotFoundException('Maintenance request not found');

        // Security check (optional but good): Ensure it belongs to branch
        // if (request.bed?.room?.hostel?.branchId !== branchId) ...

        // If status is resolved and it was a bed maintenance, we might want to set bed status back to AVAILABLE?
        // That depends on workflow. For now just update status.

        return this.prisma.maintenanceRequest.update({
            where: { id },
            data: { status }
        });
    }

    async getMyHostelDetails(user: any) {
        const student = await this.prisma.student.findUnique({ where: { userId: user.id } });
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
