import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { EmployeesModule } from './employees/employees.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { BranchesModule } from './branches/branches.module';
import { StudentsModule } from './students/students.module';
import { ClassesModule } from './classes/classes.module';
import { SubjectsModule } from './subjects/subjects.module';
import { AttendanceModule } from './attendance/attendance.module';
import { HostelsModule } from './hostels/hostels.module';
import { FinanceModule } from './finance/finance.module';
import { TransportModule } from './transport/transport.module';
import { AcademicsModule } from './academics/academics.module';
import { ExamsModule } from './exams/exams.module';
import { ReportingModule } from './reporting/reporting.module';
import { SettingsModule } from './settings/settings.module';
import { PermissionsModule } from './permissions/permissions.module';
import { SessionsModule } from './sessions/sessions.module';
import { CertificatesModule } from './certificates/certificates.module';
import { LibraryModule } from './library/library.module';
import { LiveClassesModule } from './live-classes/live-classes.module';
import { OnlineAdmissionModule } from './online-admission/online-admission.module';
import { StudentCategoryModule } from './students/student-category.module';
import { OnlineExamsModule } from './online-exams/online-exams.module';
import { ReceptionModule } from './reception/reception.module';
import { InventoryModule } from './inventory/inventory.module';
import { StakeholderModule } from './stakeholder/stakeholder.module';
import { EventsModule } from './events/events.module';
import { AccessControlModule } from './access-control/access-control.module';
import { AutomationModule } from './automation/automation.module';
import { SearchModule } from './search/search.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { CardsModule } from './cards/cards.module';
import { MailModule } from './mail/mail.module';
import { UploadModule } from './upload/upload.module';

// NOTE: Run `npm install @nestjs/throttler` to enable rate limiting, then
// uncomment the ThrottlerModule import and include it in the imports array below.
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]), // 10 requests per minute globally; auth routes use stricter limits
    AuthModule,
    AuditModule,
    EmployeesModule,
    UsersModule,
    PrismaModule,
    BranchesModule,
    StudentsModule,
    ClassesModule,
    SubjectsModule,
    AttendanceModule,
    HostelsModule,
    FinanceModule,
    TransportModule,
    AcademicsModule,
    ExamsModule,
    ReportingModule,
    SettingsModule,
    PermissionsModule,
    SessionsModule,
    CertificatesModule,
    LibraryModule,
    LiveClassesModule,
    StudentCategoryModule,
    OnlineAdmissionModule,
    OnlineExamsModule,
    ReceptionModule,
    InventoryModule,
    StakeholderModule,
    EventsModule,
    AccessControlModule,
    AutomationModule,
    SearchModule,
    AssignmentsModule,
    CardsModule,
    MailModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Uncomment after installing @nestjs/throttler:
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule { }
