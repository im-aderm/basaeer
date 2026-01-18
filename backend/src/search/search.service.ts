import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) { }

    async globalSearch(branchId: string, query: string) {
        if (!query || query.length < 2) return { students: [], staff: [], inventory: [], events: [] };

        const normalizedQuery = query.toLowerCase();

        // Run searches in parallel with optimized field selection
        const [students, users, inventory, events] = await Promise.all([
            this.prisma.student.findMany({
                where: {
                    branchId,
                    OR: [
                        { firstName: { contains: query, mode: 'insensitive' } },
                        { lastName: { contains: query, mode: 'insensitive' } }
                    ]
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                },
                take: 5,
                orderBy: { firstName: 'asc' }
            }),
            this.prisma.user.findMany({
                where: {
                    branchId,
                    role: { notIn: ['STUDENT', 'PARENT'] },
                    OR: [
                        { firstName: { contains: query, mode: 'insensitive' } },
                        { lastName: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } }
                    ]
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true
                },
                take: 5,
                orderBy: { firstName: 'asc' }
            }),
            this.prisma.inventoryProduct.findMany({
                where: {
                    branchId,
                    name: { contains: query, mode: 'insensitive' }
                },
                select: {
                    id: true,
                    name: true,
                    stock: true
                },
                take: 5,
                orderBy: { name: 'asc' }
            }),
            this.prisma.campusEvent.findMany({
                where: {
                    branchId,
                    title: { contains: query, mode: 'insensitive' }
                },
                select: {
                    id: true,
                    title: true,
                    startDate: true
                },
                take: 5,
                orderBy: { startDate: 'desc' }
            })
        ]);

        return {
            students,
            staff: users,
            inventory,
            events
        };
    }
}
