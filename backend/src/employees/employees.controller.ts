import { Controller, Post, Get, Body, UseGuards, Request, Patch, Param, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard } from '../auth/branch.guard';
import { UserRole } from '../generated/client/client';
import { PayrollService } from './payroll.service';
import { LeaveService } from './leave.service';
import { CreateSalaryTemplateDto, GeneratePayrollDto, CreateLeaveRequestDto, UpdateLeaveStatusDto } from './dto/hr-ops.dto';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly payrollService: PayrollService,
    private readonly leaveService: LeaveService
  ) { }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createEmployee(@Request() req, @Body() createEmployeeDto: CreateEmployeeDto) {
    if (!createEmployeeDto.branchId && req.user.branchId) {
      createEmployeeDto.branchId = req.user.branchId;
    }
    return this.employeesService.createEmployee(createEmployeeDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAllEmployees(@Request() req) {
    return this.employeesService.findAllEmployees(req.user.branchId);
  }

  @Get('teachers')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAllTeachers(@Request() req) {
    return this.employeesService.findAllTeachers(req.user.branchId);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.employeesService.updateStaffStatus(id, status);
  }


  // --- Payroll Endpoints ---
  @Post('salary-template')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  upsertSalaryTemplate(@Request() req, @Body() dto: CreateSalaryTemplateDto) {
    if (!dto.branchId && req.user.branchId) {
      dto.branchId = req.user.branchId;
    }
    return this.payrollService.createOrUpdateSalaryTemplate(dto);
  }

  @Post('payroll/generate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT, UserRole.HR)
  generatePayroll(@Request() req, @Body() dto: GeneratePayrollDto) {
    return this.payrollService.generateMonthlyPayroll({ ...dto, branchId: req.user.branchId });
  }


  @Patch('payroll/:id/paid')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  markAsPaid(@Param('id') id: string) {
    return this.payrollService.markAsPaid(id);
  }

  // --- Leave Endpoints ---
  @Post('leave-request')
  async applyLeave(@Request() req, @Body() dto: CreateLeaveRequestDto) {
    const staff = await this.employeesService.findByUserId(req.user.id);
    return this.leaveService.applyLeave(staff.id, dto);
  }

  @Get('leave-requests/branch')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getBranchLeaves(@Request() req) {
    return this.leaveService.getBranchLeaveRequests(req.user.branchId);
  }

  @Patch('leave-requests/:id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  updateLeaveStatus(@Param('id') id: string, @Body() dto: UpdateLeaveStatusDto) {
    return this.leaveService.updateLeaveStatus(id, dto);
  }

  // --- Parameterized Routes (at the end to avoid shadowing) ---
  @Get(':id/payroll-history')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT, UserRole.HR)
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
  getAllAwards(@Request() req) {
    return this.employeesService.findAllAwards(req.user.branchId);
  }

  @Get('my-awards')
  async getMyAwards(@Request() req) {
    const staff = await this.employeesService.findByUserId(req.user.id);
    return this.employeesService.findMyAwards(staff.id);
  }

  // --- Advance Salary Endpoints ---
  @Post('advance-salary/request')
  async requestAdvance(@Request() req, @Body('amount') amount: number, @Body('reason') reason: string) {
    const staff = await this.employeesService.findByUserId(req.user.id);
    return this.employeesService.requestAdvance(staff.id, amount, reason);
  }

  @Get('advance-salary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getBranchAdvances(@Request() req) {
    return this.employeesService.findAllAdvances(req.user.branchId);
  }

  @Get('my-advance-salary')
  async getMyAdvances(@Request() req) {
    const staff = await this.employeesService.findByUserId(req.user.id);
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
  recordAttendance(@Body() data: { staffId: string; date: string; status: any; remarks?: string }) {
    return this.employeesService.recordAttendance(data);
  }

  @Post('attendance/bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  recordBulkAttendance(@Body() data: { staffIds: string[]; date: string; status: any }) {
    const promises = data.staffIds.map(id =>
      this.employeesService.recordAttendance({ staffId: id, date: data.date, status: data.status })
    );
    return Promise.all(promises);
  }

  @Get('attendance/branch')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getBranchAttendance(@Request() req, @Query('date') date: string) {
    const searchDate = date || new Date().toISOString().split('T')[0];
    return this.employeesService.getBranchAttendance(req.user.branchId, searchDate);
  }

  @Get(':id/attendance')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getStaffAttendance(@Param('id') id: string) {
    return this.employeesService.getStaffAttendanceHistory(id);
  }
}
