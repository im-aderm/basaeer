import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBookDto,
  UpdateBookDto,
  BorrowBookDto,
  CreateBookCopyDto,
  BorrowByBarcodeDto,
  ReserveBookDto,
} from './dto/library.dto';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import { UserRole } from '../generated/client/client';

@Injectable()
export class LibraryService {
  constructor(private prisma: PrismaService) {}

  async resolveOwnStudentId(context: TenantContext): Promise<string> {
    const student = await this.prisma.student.findUnique({
      where: { userId: context.userId },
      select: { id: true },
    });
    if (!student) throw new NotFoundException('Student profile not found');
    return student.id;
  }

  async createBook(dto: CreateBookDto, context: TenantContext) {
    const branchId = dto.branchId || context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');
    if (!context.isSuperAdmin && context.branchId !== branchId) {
      throw new ForbiddenException('You do not have access to this branch');
    }

    return this.prisma.book.create({
      data: {
        ...dto,
        branchId,
        available: dto.quantity,
      },
    });
  }

  async updateBook(id: string, dto: UpdateBookDto, context: TenantContext) {
    const book = await this.prisma.book.findFirst({
      where: TenantHelper.applyIsolation({ id, deletedAt: null }, context),
    });
    if (!book) throw new NotFoundException('Book not found');

    return this.prisma.book.update({
      where: { id },
      data: dto,
    });
  }

  async deleteBook(id: string, context: TenantContext) {
    const book = await this.prisma.book.findFirst({
      where: TenantHelper.applyIsolation({ id, deletedAt: null }, context),
    });
    if (!book) throw new NotFoundException('Book not found');

    return this.prisma.book.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async createBookCopy(dto: CreateBookCopyDto, context: TenantContext) {
    const book = await this.prisma.book.findFirst({
      where: TenantHelper.applyIsolation({ id: dto.bookId, deletedAt: null }, context),
      select: { id: true, branchId: true },
    });
    if (!book) throw new NotFoundException('Book not found');

    return this.prisma.bookCopy.create({
      data: {
        bookId: dto.bookId,
        barcode: dto.barcode,
        accessionNumber: dto.accessionNumber,
        condition: dto.condition,
        status: 'AVAILABLE',
        branchId: book.branchId,
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
      deletedAt: null,
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
        include: { bookCopies: true },
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

  async findOneBook(id: string, context: TenantContext) {
    const book = await this.prisma.book.findFirst({
      where: TenantHelper.applyIsolation({ id, deletedAt: null }, context),
      include: {
        bookCopies: true,
        borrowRecords: {
          include: { student: { include: { user: true } }, bookCopy: true },
          orderBy: { borrowDate: 'desc' },
        },
      },
    });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async borrowBook(dto: BorrowBookDto, context: TenantContext) {
    const book = await this.prisma.book.findFirst({
      where: TenantHelper.applyIsolation({ id: dto.bookId, deletedAt: null }, context),
    });
    if (!book) throw new NotFoundException('Book not found');
    if (book.available <= 0)
      throw new BadRequestException('No copies available');

    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: dto.studentId }, context),
      select: { branchId: true },
    });
    if (!student) throw new NotFoundException('Student not found');

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
          branchId: student.branchId,
        },
      });
    });
  }

  async borrowBookByBarcode(dto: BorrowByBarcodeDto, context: TenantContext) {
    const copy = await this.prisma.bookCopy.findFirst({
      where: TenantHelper.applyIsolation({ barcode: dto.barcode }, context),
      include: { book: true },
    });
    if (!copy) throw new NotFoundException('Book copy not found');
    if (copy.status !== 'AVAILABLE')
      throw new BadRequestException('Copy is not available');

    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: dto.studentId }, context),
      select: { branchId: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.bookCopy.update({
        where: { id: copy.id },
        data: { status: 'BORROWED' },
      });

      await tx.book.update({
        where: { id: copy.bookId },
        data: { available: { decrement: 1 } },
      });

      return tx.borrowRecord.create({
        data: {
          bookId: copy.bookId,
          bookCopyId: copy.id,
          studentId: dto.studentId,
          dueDate: new Date(dto.dueDate),
          status: 'BORROWED',
          branchId: student.branchId,
        },
      });
    });
  }

  async returnBook(borrowRecordId: string, context: TenantContext) {
    const record = await this.prisma.borrowRecord.findFirst({
      where: TenantHelper.applyIsolation({ id: borrowRecordId }, context),
      include: { student: { select: { branchId: true } } },
    });
    if (!record) throw new NotFoundException('Borrow record not found');
    if (record.status === 'RETURNED')
      throw new BadRequestException('Book already returned');

    const now = new Date();
    const dueDate = new Date(record.dueDate);
    let fineAmount = 0;

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

      if (record.bookCopyId) {
        await tx.bookCopy.update({
          where: { id: record.bookCopyId },
          data: { status: 'AVAILABLE' },
        });
      }

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
            borrowRecordId: borrowRecordId,
            branchId: record.student.branchId,
          },
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
        bookCopy: true,
        student: { include: { user: true } },
      },
    });
  }

  async getStudentBorrowingHistory(studentId: string, context: TenantContext) {
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
    });
    if (!student) throw new NotFoundException('Student not found');
    return this.prisma.borrowRecord.findMany({
      where: { studentId },
      include: { book: true, bookCopy: true },
      orderBy: { borrowDate: 'desc' },
    });
  }

  async findAllBorrowRecords(branchId: string | null, studentId?: string) {
    return this.prisma.borrowRecord.findMany({
      where: {
        ...(branchId && { book: { branchId } }),
        ...(studentId && { studentId }),
      },
      include: {
        book: true,
        bookCopy: true,
        student: { include: { user: true } },
      },
      orderBy: { borrowDate: 'desc' },
    });
  }

  async getLibraryStats(context: TenantContext) {
    const branchId = context.isSuperAdmin ? null : context.branchId;
    const [
      totalBooks,
      availableBooks,
      borrowedRecords,
      overdueRecords,
      pendingFines,
    ] = await Promise.all([
      this.prisma.book.count({ where: { deletedAt: null, ...(branchId && { branchId }) } }),
      this.prisma.book.aggregate({
        where: { deletedAt: null, ...(branchId && { branchId }) },
        _sum: { available: true },
      }),
      this.prisma.borrowRecord.count({
        where: { status: 'BORROWED', ...(branchId && { book: { branchId } }) },
      }),
      this.prisma.borrowRecord.count({
        where: {
          status: 'BORROWED',
          dueDate: { lt: new Date() },
          ...(branchId && { book: { branchId } }),
        },
      }),
      this.prisma.libraryFine.aggregate({
        where: { status: 'PENDING', ...(branchId && { branchId }) },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalBooks,
      availableBooks: availableBooks._sum.available || 0,
      borrowedBooks: borrowedRecords,
      overdueBooks: overdueRecords,
      pendingFines: pendingFines._sum.amount || 0,
    };
  }

  // --- Reservations ---

  async reserveBook(dto: ReserveBookDto, context: TenantContext) {
    const studentId =
      context.role === UserRole.STUDENT
        ? await this.resolveOwnStudentId(context)
        : dto.studentId;
    if (!studentId) throw new BadRequestException('studentId is required');

    const book = await this.prisma.book.findFirst({
      where: TenantHelper.applyIsolation({ id: dto.bookId, deletedAt: null }, context),
    });
    if (!book) throw new NotFoundException('Book not found');

    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
      select: { id: true, branchId: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    const existing = await this.prisma.bookReservation.findFirst({
      where: { bookId: dto.bookId, studentId, status: 'PENDING' },
    });
    if (existing)
      throw new ConflictException(
        'A pending reservation already exists for this student and book',
      );

    const expiresAt = dto.expiresAt
      ? new Date(dto.expiresAt)
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    return this.prisma.bookReservation.create({
      data: {
        bookId: dto.bookId,
        studentId,
        expiresAt,
        branchId: student.branchId,
      },
      include: { book: true },
    });
  }

  async cancelReservation(id: string, context: TenantContext) {
    const reservation = await this.prisma.bookReservation.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    if (context.role === UserRole.STUDENT) {
      const ownStudentId = await this.resolveOwnStudentId(context);
      if (reservation.studentId !== ownStudentId) {
        throw new ForbiddenException('You do not have access to this reservation');
      }
    }

    if (reservation.status !== 'PENDING') {
      throw new BadRequestException('Only pending reservations can be cancelled');
    }

    return this.prisma.bookReservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async getReservations(context: TenantContext, status?: string) {
    return this.prisma.bookReservation.findMany({
      where: {
        ...TenantHelper.applyIsolation({}, context),
        ...(status && { status }),
      },
      include: { book: true, student: { include: { user: true } } },
      orderBy: { reservedAt: 'asc' },
    });
  }

  async getMyReservations(context: TenantContext) {
    const studentId = await this.resolveOwnStudentId(context);
    return this.prisma.bookReservation.findMany({
      where: { studentId },
      include: { book: true },
      orderBy: { reservedAt: 'desc' },
    });
  }

  async fulfillReservation(id: string, context: TenantContext) {
    const reservation = await this.prisma.bookReservation.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.status !== 'PENDING') {
      throw new BadRequestException('Reservation is not pending');
    }
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    return this.prisma.$transaction(async (tx) => {
      const decremented = await tx.book.updateMany({
        where: { id: reservation.bookId, available: { gt: 0 } },
        data: { available: { decrement: 1 } },
      });
      if (decremented.count === 0) {
        throw new BadRequestException(
          'No copies currently available to fulfill this reservation',
        );
      }

      await tx.bookReservation.update({
        where: { id },
        data: { status: 'FULFILLED' },
      });

      const availableCopy = await tx.bookCopy.findFirst({
        where: { bookId: reservation.bookId, status: 'AVAILABLE' },
      });

      if (availableCopy) {
        await tx.bookCopy.update({
          where: { id: availableCopy.id },
          data: { status: 'BORROWED' },
        });
      }

      return tx.borrowRecord.create({
        data: {
          bookId: reservation.bookId,
          bookCopyId: availableCopy?.id,
          studentId: reservation.studentId,
          dueDate,
          status: 'BORROWED',
          branchId: reservation.branchId,
        },
      });
    });
  }
}
