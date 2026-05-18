import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { validate } from './config/env.validation';
import { AppController } from './app.controller';
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

import { SessionsModule } from './sessions/sessions.module';
import { CertificatesModule } from './certificates/certificates.module';
import { LibraryModule } from './library/library.module';
import { LiveClassesModule } from './live-classes/live-classes.module';
import { OnlineAdmissionModule } from './online-admission/online-admission.module';
import { AdmissionExamModule } from './admission-exam/admission-exam.module';
import { AdmissionInterviewModule } from './admission-interview/admission-interview.module';
import { StudentCategoryModule } from './students/student-category.module';
import { OnlineExamsModule } from './online-exams/online-exams.module';
import { ReceptionModule } from './reception/reception.module';
import { InventoryModule } from './inventory/inventory.module';
import { StakeholderModule } from './stakeholder/stakeholder.module';
import { EventsModule } from './events/events.module';
import { AccessControlModule } from './access-control/access-control.module';
import { AutomationModule } from './automation/automation.module';
import { ModulesConfigModule } from './modules-config/modules-config.module';
import { TranslationsModule } from './translations/translations.module';
import { UserPreferencesModule } from './users/preferences/preferences.module';
import { SearchModule } from './search/search.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { CardsModule } from './cards/cards.module';
import { MailModule } from './mail/mail.module';
import { UploadModule } from './upload/upload.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProvidersModule } from './providers/providers.module';
import { CommsModule } from './comms/comms.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AlumniModule } from './alumni/alumni.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { InstitutionalEventsService } from './common/events/institutional-events.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { DataRetentionService } from './common/services/data-retention.service';
import { HealthModule } from './health/health.module';
import { PermissionsGuard } from './auth/permissions.guard';
import { MustChangePasswordGuard } from './auth/must-change-password.guard';
import { RolesModule } from './roles/roles.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AcademicSessionsModule } from './academic-sessions/academic-sessions.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]), // 100 requests per minute globally
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
          password: process.env.REDIS_PASSWORD,
          ttl: 60000, // 60 seconds default
        }),
      }),
    }),
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
    SessionsModule,
    CertificatesModule,
    LibraryModule,
    LiveClassesModule,
    OnlineAdmissionModule,
    AdmissionExamModule,
    AdmissionInterviewModule,
    StudentCategoryModule,
    OnlineExamsModule,
    ReceptionModule,
    InventoryModule,
    StakeholderModule,
    EventsModule,
    AccessControlModule,
    AutomationModule,
    ModulesConfigModule,
    TranslationsModule,
    UserPreferencesModule,
    SearchModule,
    AssignmentsModule,
    CardsModule,
    MailModule,
    UploadModule,
    NotificationsModule,
    ProvidersModule,
    CommsModule,
    RealtimeModule,
    AlumniModule,
    AttachmentsModule,
    IntegrationsModule,
    HealthModule,
    RolesModule,
    AnalyticsModule,
    AcademicSessionsModule,
  ],
  controllers: [AppController],
  providers: [
    InstitutionalEventsService,
    DataRetentionService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    PermissionsGuard,
    MustChangePasswordGuard,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
