import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaryTemplateDto, GeneratePayrollDto } from './dto/hr-ops.dto';
import { RealtimeService } from '../realtime/realtime.service';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class PayrollService {
  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeService,
  ) {}

  async createOrUpdateSalaryTemplate(dto: CreateSalaryTemplateDto) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: dto.staffId },
      include: { user: { select: { branchId: true } } },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    return this.prisma.salaryTemplate.upsert({
      where: { staffId: dto.staffId },
      update: {
        basicSalary: dto.basicSalary,
        allowances: dto.allowances,
        deductions: dto.deductions,
        netSalary: dto.netSalary,
      },
      create: {
        staffId: dto.staffId,
        basicSalary: dto.basicSalary,
        allowances: dto.allowances,
        deductions: dto.deductions,
        netSalary: dto.netSalary,
        branchId: staff.user?.branchId ?? '',
      },
    });
  }

  async generateMonthlyPayroll(dto: GeneratePayrollDto) {
    const staffWithTemplates = await this.prisma.staff.findMany({
      where: {
        user: { branchId: dto.branchId },
        status: 'ACTIVE' as any,
        salaryTemplate: { isNot: null },
      },
      include: { salaryTemplate: true },
    });

    if (staffWithTemplates.length === 0) {
      throw new BadRequestException(
        'No active staff with salary templates found in this branch',
      );
    }

    const payrollEntries: any[] = [];

    for (const staff of staffWithTemplates) {
      // Check if payroll already exists for this staff/month/year
      const existing = await this.prisma.payroll.findFirst({
        where: {
          staffId: staff.id,
          month: dto.month,
          year: dto.year,
        },
      });

      if (!existing) {
        // Approved salary advances were tracked but never reconciled
        // against the next payslip — money paid out as an advance stayed
        // outstanding forever instead of being deducted here. Settle every
        // APPROVED advance for this staff member into this payroll run,
        // atomically marking each one PAID so it's never deducted twice.
        const payroll = await this.prisma.$transaction(async (tx) => {
          const pendingAdvances = await tx.advanceSalary.findMany({
            where: { staffId: staff.id, status: 'APPROVED' },
          });
          const advanceTotal = pendingAdvances.reduce(
            (sum, a) => sum + Number(a.amount),
            0,
          );
          const netSalary = Number(staff.salaryTemplate?.netSalary || 0);
          const amountPaid = Math.max(0, netSalary - advanceTotal);

          const created = await tx.payroll.create({
            data: {
              staffId: staff.id,
              month: dto.month,
              year: dto.year,
              amountPaid,
              status: 'UNPAID',
              branchId: dto.branchId,
            },
          });

          if (pendingAdvances.length > 0) {
            await tx.advanceSalary.updateMany({
              where: { id: { in: pendingAdvances.map((a) => a.id) } },
              data: { status: 'PAID' },
            });
          }

          return created;
        });
        payrollEntries.push(payroll);
      }
    }

    const totalAmount = payrollEntries.reduce(
      (sum, e) => sum + (e.amountPaid || 0),
      0,
    );
    this.realtime.sendToBranch(dto.branchId, 'hr.payroll_generated', {
      month: dto.month,
      year: dto.year,
      staffCount: payrollEntries.length,
      totalAmount,
    });

    return {
      message: `Generated ${payrollEntries.length} new payroll entries`,
      entries: payrollEntries,
    };
  }

  async getStaffPayrollHistory(staffId: string, context: TenantContext) {
    const staff = await this.prisma.staff.findFirst({
      where: TenantHelper.applyNestedIsolation({ id: staffId }, 'user', context),
    });
    if (!staff) throw new NotFoundException('Staff not found');
    return this.prisma.payroll.findMany({
      where: { staffId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async markAsPaid(payrollId: string, context: TenantContext) {
    const payroll = await this.prisma.payroll.findFirst({
      where: TenantHelper.applyIsolation({ id: payrollId }, context),
    });
    if (!payroll) throw new NotFoundException('Payroll not found');
    return this.prisma.payroll.update({
      where: { id: payrollId },
      data: { status: 'PAID', paymentDate: new Date() },
    });
  }
}
