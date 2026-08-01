import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import {
  CreateBookDto,
  UpdateBookDto,
  BorrowBookDto,
  CreateBookCopyDto,
  BorrowByBarcodeDto,
  ReserveBookDto,
} from './dto/library.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { UserRole } from '../generated/client/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
@ApiTags('Library')
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateBookDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Book' })
  @Post('books')
  @Permissions('library:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  createBook(
    @Body() dto: CreateBookDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.libraryService.createBook(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('books')
  @Permissions('library:read')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One Book' })
  @Get('books/:id')
  @Permissions('library:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  findOneBook(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.libraryService.findOneBook(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateBookDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Book' })
  @Patch('books/:id')
  @Permissions('library:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  updateBook(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.libraryService.updateBook(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Book' })
  @Delete('books/:id')
  @Permissions('library:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  deleteBook(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.libraryService.deleteBook(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateBookCopyDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Book Copy' })
  @Post('book-copies')
  @Permissions('library:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  createBookCopy(
    @Body() dto: CreateBookCopyDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.libraryService.createBookCopy(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: BorrowBookDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Borrow Book' })
  @Post('borrow')
  @Permissions('library:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  borrowBook(@Body() dto: BorrowBookDto, @GetTenantContext() ctx: TenantContext) {
    return this.libraryService.borrowBook(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: BorrowByBarcodeDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Borrow Book By Barcode' })
  @Post('borrow-by-barcode')
  @Permissions('library:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  borrowBookByBarcode(
    @Body() dto: BorrowByBarcodeDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.libraryService.borrowBookByBarcode(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Return Book' })
  @Post('return/:recordId')
  @Permissions('library:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  returnBook(@Param('recordId') recordId: string, @GetTenantContext() ctx: TenantContext) {
    return this.libraryService.returnBook(recordId, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All Borrow Records' })
  @Get('borrow-records')
  @Permissions('library:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  findAllBorrowRecords(
    @GetTenantContext() ctx: TenantContext,
    @Query('studentId') studentId?: string,
  ) {
    return this.libraryService.findAllBorrowRecords(
      ctx.isSuperAdmin ? null : ctx.branchId,
      studentId,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve My Borrow History' })
  @Get('my-history')
  @Permissions('library:read')
  @Roles(UserRole.STUDENT)
  async getMyBorrowHistory(@GetTenantContext() ctx: TenantContext) {
    const studentId = await this.libraryService.resolveOwnStudentId(ctx);
    return this.libraryService.getStudentBorrowingHistory(studentId, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Stats' })
  @Get('stats')
  @Permissions('library:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  getStats(@GetTenantContext() ctx: TenantContext) {
    return this.libraryService.getLibraryStats(ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Overdue Books' })
  @Get('overdue')
  @Permissions('library:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  getOverdueBooks(@GetTenantContext() ctx: TenantContext) {
    return this.libraryService.getOverdueBooks(
      ctx.isSuperAdmin ? null : ctx.branchId,
    );
  }

  // --- Reservations ---

  @ApiBearerAuth()
  @ApiBody({ type: ReserveBookDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Reserve Book' })
  @Post('reservations')
  @Permissions('library:create')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.LIBRARIAN,
    UserRole.BRANCH_ADMIN,
    UserRole.STUDENT,
  )
  reserveBook(@Body() dto: ReserveBookDto, @GetTenantContext() ctx: TenantContext) {
    return this.libraryService.reserveBook(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Reservation Queue' })
  @Get('reservations')
  @Permissions('library:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  getReservations(
    @GetTenantContext() ctx: TenantContext,
    @Query('status') status?: string,
  ) {
    return this.libraryService.getReservations(ctx, status);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve My Reservations' })
  @Get('my-reservations')
  @Permissions('library:read')
  @Roles(UserRole.STUDENT)
  getMyReservations(@GetTenantContext() ctx: TenantContext) {
    return this.libraryService.getMyReservations(ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Cancel Reservation' })
  @Patch('reservations/:id/cancel')
  @Permissions('library:update')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.LIBRARIAN,
    UserRole.BRANCH_ADMIN,
    UserRole.STUDENT,
  )
  cancelReservation(
    @Param('id') id: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.libraryService.cancelReservation(id, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Fulfill Reservation' })
  @Patch('reservations/:id/fulfill')
  @Permissions('library:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.BRANCH_ADMIN)
  fulfillReservation(
    @Param('id') id: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.libraryService.fulfillReservation(id, ctx);
  }
}
