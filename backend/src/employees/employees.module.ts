import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { DepartmentsModule } from './departments/departments.module';
import { DesignationsModule } from './designations/designations.module';
import { PayrollService } from './payroll.service';
import { LeaveService } from './leave.service';
import { LeaveValidationService } from './leave-validation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    PrismaModule,
    RealtimeModule,
    DepartmentsModule,
    DesignationsModule,
  ],
  controllers: [EmployeesController],
  providers: [
    EmployeesService,
    PayrollService,
    LeaveService,
    LeaveValidationService,
  ],
  exports: [
    EmployeesService,
    PayrollService,
    LeaveService,
    LeaveValidationService,
  ],
})
export class EmployeesModule {}
