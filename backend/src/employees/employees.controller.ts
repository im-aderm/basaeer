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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
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

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly payrollService: PayrollService,
    private readonly leaveService: LeaveService,
  ) {}

  @Post()
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

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAllEmployees(@GetTenantContext() ctx: TenantContext) {
    return this.employeesService.findAllEmployees(ctx.branchId);
  }

  // ... keep existing code sync

  findAllTeachers(@GetTenantContext() ctx: TenantContext) {
    return this.employeesService.findAllTeachers(ctx.branchId);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.employeesService.updateStaffStatus(id, status);
  }

  // --- Payroll Endpoints ---
  @Post('salary-template')
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

  @Post('payroll/generate')
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

  @Patch('payroll/:id/paid')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  markAsPaid(@Param('id') id: string) {
    return this.payrollService.markAsPaid(id);
  }

  // --- Leave Endpoints ---
  @Post('leave-request')
  async applyLeave(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    const staff = await this.employeesService.findByUserId(ctx.userId);
    return this.leaveService.applyLeave(staff.id, dto, ctx.branchId!);
  }

  @Get('leave-requests/branch')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getBranchLeaves(@GetTenantContext() ctx: TenantContext) {
    return this.leaveService.getBranchLeaveRequests(ctx.branchId!);
  }

  @Get('leave-balances/:staffId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getLeaveBalances(
    @Param('staffId') staffId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.leaveService.getLeaveBalances(staffId, ctx.branchId!);
  }

  @Get('my-leave-balances')
  async getMyLeaveBalances(@GetTenantContext() ctx: TenantContext) {
    const staff = await this.employeesService.findByUserId(ctx.userId);
    return this.leaveService.getLeaveBalances(staff.id, ctx.branchId!);
  }

  @Patch('leave-requests/:id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  updateLeaveStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveStatusDto,
  ) {
    return this.leaveService.updateLeaveStatus(id, dto);
  }

  // --- Parameterized Routes (at the end to avoid shadowing) ---
  @Get(':id/payroll-history')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.ACCOUNTANT,
    UserRole.HR,
  )
  getPayrollHistory(@Param('id') staffId: string) {
    return this.payrollService.getStaffPayrollHistory(staffId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  findOne(@Param('id') id: string) {
    return this.employeesService.findOneStaff(id);
  }

  // --- Awards Endpoints ---
  @Post('awards')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  createAward(@Body() data: any) {
    return this.employeesService.createAward(data);
  }

  @Get('awards')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getAllAwards(@GetTenantContext() ctx: TenantContext) {
    return this.employeesService.findAllAwards(ctx.branchId ?? undefined);
  }

  @Get('my-awards')
  async getMyAwards(@GetTenantContext() ctx: TenantContext) {
    const staff = await this.employeesService.findByUserId(ctx.userId);
    return this.employeesService.findMyAwards(staff.id);
  }

  // --- Advance Salary Endpoints ---
  @Post('advance-salary/request')
  async requestAdvance(
    @GetTenantContext() ctx: TenantContext,
    @Body('amount') amount: number,
    @Body('reason') reason: string,
  ) {
    const staff = await this.employeesService.findByUserId(ctx.userId);
    return this.employeesService.requestAdvance(staff.id, amount, reason);
  }

  @Get('advance-salary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getBranchAdvances(@GetTenantContext() ctx: TenantContext) {
    return this.employeesService.findAllAdvances(ctx.branchId ?? undefined);
  }

  @Get('my-advance-salary')
  async getMyAdvances(@GetTenantContext() ctx: TenantContext) {
    const staff = await this.employeesService.findByUserId(ctx.userId);
    return this.employeesService.findMyAdvances(staff.id);
  }

  @Patch('advance-salary/:id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  approveAdvance(@Param('id') id: string) {
    return this.employeesService.updateAdvanceStatus(id, 'APPROVED');
  }

  @Patch('advance-salary/:id/reject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  rejectAdvance(@Param('id') id: string) {
    return this.employeesService.updateAdvanceStatus(id, 'REJECTED');
  }

  // --- Attendance Endpoints ---
  @Post('attendance')
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

  @Post('attendance/bulk')
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

  @Get('attendance/branch')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getBranchAttendance(
    @GetTenantContext() ctx: TenantContext,
    @Query('date') date: string,
  ) {
    const searchDate = date || new Date().toISOString().split('T')[0];
    return this.employeesService.getBranchAttendance(ctx.branchId!, searchDate);
  }

  @Get(':id/attendance')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getStaffAttendance(@Param('id') id: string) {
    return this.employeesService.getStaffAttendanceHistory(id);
  }
}
