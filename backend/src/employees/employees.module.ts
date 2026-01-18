import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { DepartmentsModule } from './departments/departments.module';
import { DesignationsModule } from './designations/designations.module';
import { PayrollService } from './payroll.service';
import { LeaveService } from './leave.service';

@Module({
  imports: [DepartmentsModule, DesignationsModule],
  controllers: [EmployeesController],
  providers: [EmployeesService, PayrollService, LeaveService],
  exports: [EmployeesService, PayrollService, LeaveService],
})
export class EmployeesModule { }
