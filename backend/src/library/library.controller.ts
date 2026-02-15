import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, Query } from '@nestjs/common';
import { LibraryService } from './library.service';
import { CreateBookDto, BorrowBookDto } from './dto/library.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('library')
export class LibraryController {
    constructor(private readonly libraryService: LibraryService) { }

    @Post('books')
    @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
    createBook(@Body() dto: CreateBookDto) {
        return this.libraryService.createBook(dto);
    }

    @Get('books')
    @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN, UserRole.STUDENT, UserRole.TEACHER)
    findAllBooks(
        @Request() req,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('category') category?: string,
    ) {
        return this.libraryService.findAllBooks(
            req.user.branchId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 10,
            search,
            category
        );
    }

    @Get('stats')
    @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
    getStats(@Request() req) {
        return this.libraryService.getLibraryStats(req.user.branchId);
    }

    @Get('books/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
    findOneBook(@Param('id') id: string) {
        return this.libraryService.findOneBook(id);
    }

    @Post('borrow')
    @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
    borrowBook(@Body() dto: BorrowBookDto) {
        return this.libraryService.borrowBook(dto);
    }

    @Patch('return/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
    returnBook(@Param('id') id: string) {
        return this.libraryService.returnBook(id);
    }

    @Get('overdue')
    @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
    getOverdueBooks(@Request() req) {
        return this.libraryService.getOverdueBooks(req.user.branchId);
    }

    @Get('history/student/:studentId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN, UserRole.STUDENT)
    getStudentHistory(@Param('studentId') studentId: string) {
        return this.libraryService.getStudentBorrowingHistory(studentId);
    }

    @Get('borrow-records')
    @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
    findAllBorrowRecords(@Request() req) {
        return this.libraryService.findAllBorrowRecords(req.user.branchId);
    }
}
