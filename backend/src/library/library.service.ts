import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto, BorrowBookDto } from './dto/library.dto';

@Injectable()
export class LibraryService {
    constructor(private prisma: PrismaService) { }

    async createBook(dto: CreateBookDto) {
        return this.prisma.book.create({
            data: {
                ...dto,
                available: dto.quantity,
            },
        });
    }

    async findAllBooks(
        branchId: string | null,
        page: number = 1,
        limit: number = 10,
        search?: string,
        category?: string,
    ) {
        const skip = (page - 1) * limit;
        const where: any = {
            ...(branchId && { branchId }),
            ...(category && { category }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { author: { contains: search, mode: 'insensitive' } },
                    { isbn: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [data, total] = await Promise.all([
            this.prisma.book.findMany({
                where,
                skip,
                take: limit,
                orderBy: { title: 'asc' },
            }),
            this.prisma.book.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOneBook(id: string) {
        const book = await this.prisma.book.findUnique({
            where: { id },
            include: {
                borrowRecords: {
                    include: { student: { include: { user: true } } },
                    orderBy: { borrowDate: 'desc' },
                },
            },
        });
        if (!book) throw new NotFoundException('Book not found');
        return book;
    }

    async borrowBook(dto: BorrowBookDto) {
        const book = await this.prisma.book.findUnique({ where: { id: dto.bookId } });
        if (!book) throw new NotFoundException('Book not found');
        if (book.available <= 0) throw new BadRequestException('No copies available');

        return this.prisma.$transaction(async (tx) => {
            await tx.book.update({
                where: { id: dto.bookId },
                data: { available: { decrement: 1 } },
            });

            return tx.borrowRecord.create({
                data: {
                    bookId: dto.bookId,
                    studentId: dto.studentId,
                    dueDate: new Date(dto.dueDate),
                    status: 'BORROWED',
                },
            });
        });
    }

    async returnBook(borrowRecordId: string) {
        const record = await this.prisma.borrowRecord.findUnique({
            where: { id: borrowRecordId },
        });
        if (!record) throw new NotFoundException('Borrow record not found');
        if (record.status === 'RETURNED') throw new BadRequestException('Book already returned');

        const now = new Date();
        const dueDate = new Date(record.dueDate);
        let fineAmount = 0;

        // Simple Fine Calculation: $10 per day overdue
        if (now > dueDate) {
            const diffTime = Math.abs(now.getTime() - dueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            fineAmount = diffDays * 10;
        }

        return this.prisma.$transaction(async (tx) => {
            await tx.book.update({
                where: { id: record.bookId },
                data: { available: { increment: 1 } },
            });

            const updatedRecord = await tx.borrowRecord.update({
                where: { id: borrowRecordId },
                data: {
                    status: 'RETURNED',
                    returnDate: now,
                },
            });

            if (fineAmount > 0) {
                await tx.libraryFine.create({
                    data: {
                        amount: fineAmount,
                        status: 'PENDING',
                        borrowRecordId: borrowRecordId
                    }
                });
            }

            return { ...updatedRecord, fineAmount };
        });
    }

    async getOverdueBooks(branchId: string | null) {
        return this.prisma.borrowRecord.findMany({
            where: {
                status: 'BORROWED',
                dueDate: { lt: new Date() },
                ...(branchId && { book: { branchId } }),
            },
            include: {
                book: true,
                student: { include: { user: true } },
            },
        });
    }

    async getStudentBorrowingHistory(studentId: string) {
        return this.prisma.borrowRecord.findMany({
            where: { studentId },
            include: { book: true },
            orderBy: { borrowDate: 'desc' },
        });
    }

    async findAllBorrowRecords(branchId: string | null) {
        return this.prisma.borrowRecord.findMany({
            where: {
                ...(branchId && { book: { branchId } })
            },
            include: {
                book: true,
                student: { include: { user: true } },
            },
            orderBy: { borrowDate: 'desc' },
        });
    }

    async getLibraryStats(branchId: string | null) {
        const [totalBooks, availableBooks, borrowedRecords, overdueRecords, pendingFines] = await Promise.all([
            this.prisma.book.count({ where: { ...(branchId && { branchId }) } }),
            this.prisma.book.aggregate({
                where: { ...(branchId && { branchId }) },
                _sum: { available: true }
            }),
            this.prisma.borrowRecord.count({
                where: { status: 'BORROWED', ...(branchId && { book: { branchId } }) }
            }),
            this.prisma.borrowRecord.count({
                where: { status: 'BORROWED', dueDate: { lt: new Date() }, ...(branchId && { book: { branchId } }) }
            }),
            this.prisma.libraryFine.aggregate({
                where: { status: 'PENDING' },
                _sum: { amount: true }
            })
        ]);

        return {
            totalBooks,
            availableBooks: availableBooks._sum.available || 0,
            borrowedBooks: borrowedRecords,
            overdueBooks: overdueRecords,
            pendingFines: pendingFines._sum.amount || 0
        };
    }
}
