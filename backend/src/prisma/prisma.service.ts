import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '../generated/client/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { AsyncLocalStorage } from 'async_hooks';
import 'dotenv/config';

class ContextRequiredError extends BadRequestException {
  constructor(
    code: 'BRANCH_CONTEXT_REQUIRED' | 'SESSION_CONTEXT_REQUIRED',
    message: string,
  ) {
    super({
      code,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

export interface TenantStore {
  branchId: string | null;
  sessionId: string | null;
  userId: string;
  isSuperAdmin?: boolean;
}

export const tenantStorage = new AsyncLocalStorage<TenantStore>();

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  readonly xprisma: ReturnType<PrismaClient['$extends']>;

  constructor() {
    const connectionString = `${process.env.DATABASE_URL}`;

    const pool = new Pool({
      connectionString,
      max: parseInt(process.env.DB_POOL_SIZE || '20', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error', 'warn'],
    } as any);

    this.xprisma = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query, operation, model }: any) {
            const store = tenantStorage.getStore();
            let branchId = store?.branchId ?? null;
            let sessionId = store?.sessionId ?? null;
            const userId = store?.userId ?? '';
            const isSuperAdmin = store?.isSuperAdmin ?? false;

            // Block writes when no branch context is set
            // Exception: Branch model creates define the tenant boundary itself
            // Exception: If args.data already has branchId (set by controller), allow it
            // Exception: If args.where already has branchId (set by service/TenantHelper), allow it
            if (!branchId && model !== 'Branch') {
              const writeOps = ['create', 'update', 'updateMany', 'delete', 'deleteMany', 'upsert'];
              if (writeOps.includes(operation)) {
                const dataBranchId = args.data?.branchId;
                const whereBranchId = args.where?.branchId;
                if (!dataBranchId && !whereBranchId) {
                  throw new ContextRequiredError(
                    'BRANCH_CONTEXT_REQUIRED',
                    'Branch context is required to modify data. Please select a branch first.',
                  );
                }
                // Use the branchId from the data or where payload
                branchId = dataBranchId || whereBranchId;
              }
              // Read operations without branch — return ALL data (for SA dashboard/reports)
              if (!writeOps.includes(operation)) {
                return query(args);
              }
            }

            // Block writes when no session context is set
            // Exception: System-level models that exist independently of academic sessions
            // Exception: If args.data already has sessionId, allow it
            // Exception: If args.where already has sessionId, allow it
            const systemModels = [
              'AcademicSession', 'Branch', 'User', 'UserPreference',
              'Role', 'RolePermission', 'CustomRolePermission',
              'GlobalSetting', 'Translation', 'ScheduledJob', 'ModuleConfiguration',
              'AuditLog', 'EmailTemplate', 'SmsTemplate',
              'Notification', 'NotificationPreference',
              'Campaign', 'CampaignRecipient',
              'QueueJobLog', 'AutomationExecution', 'MessageDeliveryLog',
              'ProviderHealthLog', 'WebhookEvent', 'DeliveryWebhookLog',
              'RealtimeConnection', 'QueueMetric', 'ProviderFailoverEvent',
              'MessageRetryEvent', 'ProviderBalanceSnapshot', 'NotificationDeliveryEvent',
              'ApiKey', 'WebhookEndpoint', 'WebhookDeliveryLog',
              'Counter', 'PaymentWebhookLog',
              // Models without sessionId in DB (lost during schema rewrite — to be restored)
              'Student', 'Staff', 'Invoice', 'InvoiceItem', 'Payment',
              'Class', 'Section', 'Subject', 'Department', 'Designation',
              'FeeCategory', 'FeeStructure', 'ExpenseCategory',
              'Bed', 'Room', 'Hostel', 'HostelAllocation', 'HostelLeave',
              'AttendanceSession', 'AttendanceScan',
              'StaffAttendance', 'StaffAward',
              'LeaveRequest', 'AdvanceSalary', 'Payroll', 'SalaryTemplate',
              'Book', 'BookCopy', 'BookReservation', 'BorrowRecord', 'LibraryFine',
              'Vehicle', 'TransportRoute', 'TransportAssignment', 'TransportAttendance',
              'Certificate', 'CertificateTemplate',
              'Assignment', 'Submission',
              'AssessmentRecord', 'AssessmentComponent', 'AssessmentScore',
              'ResultSummary', 'BehaviouralRating', 'GradingScale',
              'Exam', 'ExamType', 'ResultApproval', 'ResultPublication',
              'GPARecord', 'StudentRanking', 'Broadsheet', 'Transcript',
              'TranscriptVerification', 'AcademicRemark', 'SubjectPosition',
              'TahfeezAssessment', 'TahfeezMemorizationProgress',
              'Question', 'QuestionGroup', 'QuestionOption', 'QuestionAnswer',
              'OnlineExam', 'OnlineExamAttempt',
              'OnlineAdmission', 'AdmissionEnquiry',
              'AdmissionExam', 'AdmissionExamScore', 'AdmissionInterview',
              'PreviousSchool', 'StudentCategory',
              'InventoryCategory', 'InventoryStore', 'InventorySupplier',
              'InventoryUnit', 'InventoryProduct', 'InventoryPurchase',
              'InventoryIssue', 'InventorySale',
              'CallLog', 'VisitorLog', 'Complaint', 'PostalRecord',
              'CampusEvent', 'EventRSVP', 'Alumni', 'AlumniEvent', 'AlumniEventParticipant',
              'LiveClassSession', 'MeetingParticipant', 'GoogleMeetConfig',
              'IdCardTemplate', 'IdCard', 'DigitalResource', 'DigitalResourceLog',
              'AttachmentCategory', 'ReportTemplate', 'AcademicExport',
              'ComputationJob', 'DeactivationReason', 'LoginDeactivation',
              'AutomationConfig', 'Conversation', 'ConversationParticipant', 'Message',
              'ClassSchedule', 'MaintenanceRequest', 'HostelMaintenanceTicket',
              'CampusAccessLog',
            ];
            if (!sessionId && !systemModels.includes(model)) {
              const writeOps = ['create', 'update', 'updateMany', 'delete', 'deleteMany', 'upsert'];
              if (writeOps.includes(operation)) {
                const dataSessionId = args.data?.sessionId;
                const whereSessionId = args.where?.sessionId;
                if (!dataSessionId && !whereSessionId) {
                  throw new ContextRequiredError(
                    'SESSION_CONTEXT_REQUIRED',
                    'Session context is required to modify data. Please select a session first.',
                  );
                }
                // Use the sessionId from the data or where payload
                sessionId = dataSessionId || whereSessionId;
              }
            }

            // Apply branch and session isolation for ALL users
            // Exception: System-level models are not scoped to branch/session
            if ((branchId || sessionId) && !systemModels.includes(model)) {
              if (operation === 'create') {
                args.data = {
                  ...args.data,
                  ...(branchId && { branchId }),
                  ...(sessionId && { sessionId }),
                };
              } else if (
                operation === 'findUnique' ||
                operation === 'findFirst' ||
                operation === 'findMany' ||
                operation === 'count' ||
                operation === 'aggregate'
              ) {
                args.where = {
                  ...args.where,
                  ...(branchId && { branchId }),
                  ...(sessionId && { sessionId }),
                };
              } else if (
                operation === 'delete' ||
                operation === 'deleteMany'
              ) {
                args.where = {
                  ...args.where,
                  ...(branchId && { branchId }),
                  ...(sessionId && { sessionId }),
                };
              } else if (
                operation === 'update' ||
                operation === 'updateMany'
              ) {
                // Skip branchId/sessionId WHERE injection when the data explicitly changes them
                if (!args.data?.branchId) {
                  args.where = {
                    ...args.where,
                    ...(branchId && { branchId }),
                  };
                }
                if (!args.data?.sessionId) {
                  args.where = {
                    ...args.where,
                    ...(sessionId && { sessionId }),
                  };
                }
              } else if (operation === 'upsert') {
                // For upsert: inject branchId/sessionId into both where AND create.data
                if (!args.data?.branchId) {
                  args.where = {
                    ...args.where,
                    ...(branchId && { branchId }),
                  };
                }
                if (!args.create?.branchId) {
                  args.create = {
                    ...args.create,
                    ...(branchId && { branchId }),
                  };
                }
                if (!args.data?.sessionId) {
                  args.where = {
                    ...args.where,
                    ...(sessionId && { sessionId }),
                  };
                }
                if (!args.create?.sessionId) {
                  args.create = {
                    ...args.create,
                    ...(sessionId && { sessionId }),
                  };
                }
              }
            }

            if (branchId) {
              try {
                await (PrismaClient.prototype as any).$executeRawUnsafe?.(
                  `SELECT set_config('app.current_branch_id', $1, true)`,
                  [branchId],
                );
              } catch (_err) {
                // ignore
              }
            }
            if (sessionId) {
              try {
                await (PrismaClient.prototype as any).$executeRawUnsafe?.(
                  `SELECT set_config('app.current_session_id', $1, true)`,
                  [sessionId],
                );
              } catch (_err) {
                // ignore
              }
            }

            return query(args);
          },
        },
      },
    });

    return new Proxy(this, {
      get: (target, prop) => {
        if (
          prop === 'xprisma' ||
          prop === 'tenantStorage' ||
          prop === 'logger' ||
          prop === 'setTenantContext' ||
          prop === 'runInTenantContext' ||
          prop === 'onModuleInit' ||
          prop === 'onModuleDestroy' ||
          prop === 'constructor' ||
          typeof prop === 'symbol'
        ) {
          return Reflect.get(target, prop);
        }
        const val = Reflect.get(target.xprisma, prop);
        return typeof val === 'function' ? val.bind(target.xprisma) : val;
      },
    }) as PrismaService;
  }

  runInTenantContext<T>(branchId: string | null, sessionId: string | null, userId: string, fn: () => T): T {
    return tenantStorage.run({ branchId, sessionId, userId }, fn);
  }

  setTenantContext(branchId: string | null, sessionId: string | null, userId: string) {
    this.logger.warn(
      'setTenantContext() is deprecated. Context is now managed via TenantContextInterceptor.',
    );
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database.');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
