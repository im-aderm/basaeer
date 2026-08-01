import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateAwardDto, RequestAdvanceSalaryDto, SelfRequestAdvanceSalaryDto } from './dto/hr-ops.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { BranchGuard } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { TenantContext } from '../auth/branch.guard';
import { UserRole } from '../generated/client/client';
import { PayrollService } from './payroll.service';
import { LeaveService } from './leave.service';
import {
  CreateSalaryTemplateDto,
  GeneratePayrollDto,
  CreateLeaveRequestDto,
  UpdateLeaveStatusDto,
} from './dto/hr-ops.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly payrollService: PayrollService,
    private readonly leaveService: LeaveService,
  ) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Employee' })
  @Post()
  @Permissions('employees:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createEmployee(
    @GetTenantContext() ctx: TenantContext,
    @Body() createEmployeeDto: CreateEmployeeDto,
  ) {
    if (!createEmployeeDto.branchId && ctx.branchId) {
      createEmployeeDto.branchId = ctx.branchId;
    }
    return this.employeesService.createEmployee(createEmployeeDto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All Employees' })
  @Get()
  @Permissions('employees:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAllEmployees(@GetTenantContext() ctx: TenantContext) {
    return this.employeesService.findAllEmployees(ctx.branchId);
  }

  // ... keep existing code sync

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Teachers' })
  @Get('teachers')
  @Permissions('employees:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAllTeachers(@GetTenantContext() ctx: TenantContext) {
    return this.employeesService.findAllTeachers(ctx.branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Status' })
  @Patch(':id/status')
  @Permissions('employees:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: string, @GetTenantContext() ctx: TenantContext) {
    return this.employeesService.updateStaffStatus(id, status, ctx);
  }

  // --- Payroll Endpoints ---
  @ApiBearerAuth()
  @ApiBody({ type: CreateSalaryTemplateDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Salary Template' })
  @Post('salary-template')
  @Permissions('employees:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  upsertSalaryTemplate(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: CreateSalaryTemplateDto,
  ) {
    if (!dto.branchId && ctx.branchId) {
      dto.branchId = ctx.branchId;
    }
    return this.payrollService.createOrUpdateSalaryTemplate(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Generate Payroll' })
  @Post('payroll/generate')
  @Permissions('employees:create')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.ACCOUNTANT,
    UserRole.HR,
  )
  generatePayroll(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: GeneratePayrollDto,
  ) {
    return this.payrollService.generateMonthlyPayroll({
      ...dto,
      branchId: ctx.branchId!,
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update As Paid' })
  @Patch('payroll/:id/paid')
  @Permissions('employees:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  markAsPaid(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.payrollService.markAsPaid(id, ctx);
  }

  // --- Leave Endpoints ---
  @ApiBearerAuth()
  @ApiBody({ type: CreateLeaveRequestDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Leave' })
  @Post('leave-request')
  async applyLeave(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    const staff = await this.employeesService.findByUserId(ctx.userId, ctx);
    return this.leaveService.applyLeave(staff.id, dto, ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Branch Leaves' })
  @Get('leave-requests/branch')
  @Permissions('employees:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getBranchLeaves(@GetTenantContext() ctx: TenantContext) {
    return this.leaveService.getBranchLeaveRequests(ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Leave Balances' })
  @Get('leave-balances/:staffId')
  @Permissions('employees:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getLeaveBalances(
    @Param('staffId') staffId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.leaveService.getLeaveBalances(staffId, ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve My Leave Balances' })
  @Get('my-leave-balances')
  async getMyLeaveBalances(@GetTenantContext() ctx: TenantContext) {
    const staff = await this.employeesService.findByUserId(ctx.userId, ctx);
    return this.leaveService.getLeaveBalances(staff.id, ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Leave Status' })
  @Patch('leave-requests/:id/status')
  @Permissions('employees:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  updateLeaveStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveStatusDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.leaveService.updateLeaveStatus(id, dto, ctx);
  }

  // --- Parameterized Routes (at the end to avoid shadowing) ---
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Payroll History' })
  @Get(':id/payroll-history')
  @Permissions('employees:read')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.ACCOUNTANT,
    UserRole.HR,
  )
  getPayrollHistory(@Param('id') staffId: string, @GetTenantContext() ctx: TenantContext) {
    return this.payrollService.getStaffPayrollHistory(staffId, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get(':id')
  @Permissions('employees:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  findOne(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.employeesService.findOneStaff(id, ctx);
  }

  // --- Awards Endpoints ---
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Award' })
  @Post('awards')
  @Permissions('employees:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  createAward(@Body() dto: CreateAwardDto, @GetTenantContext() ctx: TenantContext) {
    return this.employeesService.createAward(dto, ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All Awards' })
  @Get('awards')
  @Permissions('employees:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getAllAwards(@GetTenantContext() ctx: TenantContext) {
    return this.employeesService.findAllAwards(ctx.branchId ?? undefined);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve My Awards' })
  @Get('my-awards')
  async getMyAwards(@GetTenantContext() ctx: TenantContext) {
    const staff = await this.employeesService.findByUserId(ctx.userId, ctx);
    return this.employeesService.findMyAwards(staff.id);
  }

  // --- Advance Salary Endpoints ---
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Advance' })
  @Post('advance-salary/request')
  async requestAdvance(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: SelfRequestAdvanceSalaryDto,
  ) {
    const staff = await this.employeesService.findByUserId(ctx.userId, ctx);
    return this.employeesService.requestAdvance(staff.id, dto.amount, dto.reason);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Branch Advances' })
  @Get('advance-salary')
  @Permissions('employees:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getBranchAdvances(@GetTenantContext() ctx: TenantContext) {
    return this.employeesService.findAllAdvances(ctx.branchId ?? undefined);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve My Advances' })
  @Get('my-advance-salary')
  async getMyAdvances(@GetTenantContext() ctx: TenantContext) {
    const staff = await this.employeesService.findByUserId(ctx.userId, ctx);
    return this.employeesService.findMyAdvances(staff.id);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Approve Advance' })
  @Patch('advance-salary/:id/approve')
  @Permissions('employees:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  approveAdvance(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.employeesService.updateAdvanceStatus(id, 'APPROVED', ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Reject Advance' })
  @Patch('advance-salary/:id/reject')
  @Permissions('employees:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  rejectAdvance(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.employeesService.updateAdvanceStatus(id, 'REJECTED', ctx);
  }

  // --- Attendance Endpoints ---
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Attendance' })
  @Post('attendance')
  @Permissions('employees:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  recordAttendance(
    @Body()
    data: {
      staffId: string;
      date: string;
      status: any;
      remarks?: string;
    },
  ) {
    return this.employeesService.recordAttendance(data);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Bulk Attendance' })
  @Post('attendance/bulk')
  @Permissions('employees:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  recordBulkAttendance(
    @Body()
    data: {
      records: {
        staffId: string;
        date: string;
        status: any;
        remarks?: string;
      }[];
    },
  ) {
    const promises = data.records.map((record) =>
      this.employeesService.recordAttendance(record),
    );
    return Promise.all(promises);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Branch Attendance' })
  @Get('attendance/branch')
  @Permissions('employees:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getBranchAttendance(
    @GetTenantContext() ctx: TenantContext,
    @Query('date') date: string,
  ) {
    const searchDate = date || new Date().toISOString().split('T')[0];
    return this.employeesService.getBranchAttendance(ctx.branchId!, searchDate);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Staff Attendance' })
  @Get(':id/attendance')
  @Permissions('employees:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getStaffAttendance(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.employeesService.getStaffAttendanceHistory(id, ctx);
  }
}
