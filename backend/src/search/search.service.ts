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
        classes: [],
        events: [],
      };

    const [students, users, inventory, books, invoices, hostels, classes, events] =
      await Promise.all([
        // Students — search by name using ILIKE
        this.prisma.student.findMany({
          where: {
            branchId,
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: { id: true, firstName: true, lastName: true },
          take: 10,
          orderBy: { firstName: 'asc' },
        }),

        // Staff (non-student/parent users)
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
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
          take: 10,
          orderBy: { firstName: 'asc' },
        }),

        // Inventory products
        this.prisma.inventoryProduct.findMany({
          where: {
            branchId,
            name: { contains: query, mode: 'insensitive' },
          },
          select: { id: true, name: true, stock: true },
          take: 10,
          orderBy: { name: 'asc' },
        }),

        // Books
        this.prisma.book.findMany({
          where: {
            branchId,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { author: { contains: query, mode: 'insensitive' } },
              { isbn: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: { id: true, title: true, author: true, isbn: true, available: true },
          take: 10,
          orderBy: { title: 'asc' },
        }),

        // Invoices
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

        // Hostels
        this.prisma.hostel.findMany({
          where: {
            branchId,
            name: { contains: query, mode: 'insensitive' },
          },
          select: { id: true, name: true, type: true },
          take: 5,
        }),

        // Classes
        this.prisma.class.findMany({
          where: {
            branchId,
            name: { contains: query, mode: 'insensitive' },
          },
          select: { id: true, name: true, gradeLevel: true },
          take: 10,
          orderBy: { name: 'asc' },
        }),

        // Events (AlumniEvent)
        this.prisma.alumniEvent.findMany({
          where: {
            branchId,
            title: { contains: query, mode: 'insensitive' },
          },
          select: { id: true, title: true, eventDate: true },
          take: 10,
          orderBy: { eventDate: 'desc' },
        }),
      ]);

    return {
      students,
      staff: users,
      inventory,
      books,
      invoices,
      hostel: hostels,
      classes,
      events,
    };
  }
}
