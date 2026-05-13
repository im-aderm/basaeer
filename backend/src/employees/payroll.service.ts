import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaryTemplateDto, GeneratePayrollDto } from './dto/hr-ops.dto';
import { RealtimeService } from '../realtime/realtime.service';

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
        const payroll = await this.prisma.payroll.create({
          data: {
            staffId: staff.id,
            month: dto.month,
            year: dto.year,
            amountPaid: staff.salaryTemplate?.netSalary || 0,
            status: 'UNPAID',
            branchId: dto.branchId,
          },
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

  async getStaffPayrollHistory(staffId: string) {
    return this.prisma.payroll.findMany({
      where: { staffId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async markAsPaid(payrollId: string) {
    return this.prisma.payroll.update({
      where: { id: payrollId },
      data: { status: 'PAID', paymentDate: new Date() },
    });
  }
}
