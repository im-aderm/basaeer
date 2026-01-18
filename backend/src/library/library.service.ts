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

    async findAllBooks(branchId: string) {
        return this.prisma.book.findMany({
            where: { branchId },
            orderBy: { title: 'asc' },
        });
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

        return this.prisma.$transaction(async (tx) => {
            await tx.book.update({
                where: { id: record.bookId },
                data: { available: { increment: 1 } },
            });

            return tx.borrowRecord.update({
                where: { id: borrowRecordId },
                data: {
                    status: 'RETURNED',
                    returnDate: new Date(),
                },
            });
        });
    }

    async getOverdueBooks(branchId: string) {
        return this.prisma.borrowRecord.findMany({
            where: {
                status: 'BORROWED',
                dueDate: { lt: new Date() },
                book: { branchId },
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

    async findAllBorrowRecords(branchId: string) {
        return this.prisma.borrowRecord.findMany({
            where: {
                book: { branchId }
            },
            include: {
                book: true,
                student: { include: { user: true } },
            },
            orderBy: { borrowDate: 'desc' },
        });
    }
}
