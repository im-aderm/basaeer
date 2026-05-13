import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(branchId: string, query: string) {
    if (!query || query.length < 2)
      return {
        students: [],
        staff: [],
        inventory: [],
        books: [],
        invoices: [],
        hostel: [],
      };

    // Use pg_trgm fuzzy search for students (8.8)
    const studentsPromise = this.prisma.$queryRaw<Array<{ id: string; firstName: string; lastName: string }>>`
      SELECT id, "firstName", "lastName"
      FROM "Student"
      WHERE "branchId" = ${branchId}::text
      AND ("firstName" || ' ' || "lastName") % ${query}
      LIMIT 10;
    `;

    const [students, users, inventory, books, invoices, hostels] =
      await Promise.all([
        studentsPromise,
        this.prisma.user.findMany({
          where: {
            branchId,
            role: { notIn: ['STUDENT', 'PARENT'] },
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
          take: 10,
          orderBy: { firstName: 'asc' },
        }),
        this.prisma.inventoryProduct.findMany({
          where: {
            branchId,
            name: { contains: query, mode: 'insensitive' },
          },
          select: { id: true, name: true, stock: true },
          take: 10,
          orderBy: { name: 'asc' },
        }),
        this.prisma.book.findMany({
          where: {
            branchId,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { author: { contains: query, mode: 'insensitive' } },
              { isbn: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            available: true,
          },
          take: 10,
          orderBy: { title: 'asc' },
        }),
        this.prisma.invoice.findMany({
          where: {
            branchId,
            invoiceNumber: { contains: query, mode: 'insensitive' },
          },
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            status: true,
            student: { select: { firstName: true, lastName: true } },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.hostel.findMany({
          where: {
            branchId,
            name: { contains: query, mode: 'insensitive' },
          },
          select: { id: true, name: true, type: true },
          take: 5,
        }),
      ]);

    return {
      students,
      staff: users,
      inventory,
      books,
      invoices,
      hostel: hostels,
    };
  }
}
