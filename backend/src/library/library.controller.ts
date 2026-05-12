import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { CreateBookDto, BorrowBookDto } from './dto/library.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post('books')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  createBook(
    @Body() dto: CreateBookDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    if (!dto.branchId && ctx.branchId) dto.branchId = ctx.branchId;
    return this.libraryService.createBook(dto);
  }

  @Get('books')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.LIBRARIAN,
    UserRole.BRANCH_ADMIN,
    UserRole.STUDENT,
    UserRole.TEACHER,
  )
  findAllBooks(
    @GetTenantContext() ctx: TenantContext,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    const branchId = ctx.isSuperAdmin ? null : ctx.branchId;
    return this.libraryService.findAllBooks(
      branchId,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
      search,
      category,
    );
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

  @Post('return/:recordId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  returnBook(@Param('recordId') recordId: string) {
    return this.libraryService.returnBook(recordId);
  }

  @Get('borrow-records')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  findAllBorrowRecords(@GetTenantContext() ctx: TenantContext) {
    return this.libraryService.findAllBorrowRecords(
      ctx.isSuperAdmin ? null : ctx.branchId,
    );
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  getStats(@GetTenantContext() ctx: TenantContext) {
    return this.libraryService.getLibraryStats(
      ctx.isSuperAdmin ? null : ctx.branchId,
    );
  }

  @Get('overdue')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  getOverdueBooks(@GetTenantContext() ctx: TenantContext) {
    return this.libraryService.getOverdueBooks(
      ctx.isSuperAdmin ? null : ctx.branchId,
    );
  }
}
