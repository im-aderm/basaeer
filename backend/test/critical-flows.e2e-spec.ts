import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole, BedStatus, PaymentMethod, InvoiceStatus } from '../src/generated/client/client';
import { BranchesService } from '../src/branches/branches.service';
import { StudentsService } from '../src/students/students.service';
import { HostelsService } from '../src/hostels/hostels.service';
import { FinanceService } from '../src/finance/finance.service';
import { LeaveService } from '../src/employees/leave.service';
import { EmployeesService } from '../src/employees/employees.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Critical Flows (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let jwtService: JwtService;
  let branchesService: BranchesService;
  let studentsService: StudentsService;
  let hostelsService: HostelsService;
  let financeService: FinanceService;
  let leaveService: LeaveService;
  let employeesService: EmployeesService;
  let prismaService: PrismaService;

  let superAdminToken: string;
  let branchAToken: string;
  let branchBToken: string;
  let branchAId: string;
  let branchBId: string;
  let superAdminUserId: string;
  let branchAAdminUserId: string;
  let branchBAdminUserId: string;
  let studentIdA: string;
  let createdIds: { type: string; id: string }[] = [];

  const trackId = (type: string, id: string) => {
    createdIds.push({ type, id });
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-critical-flows-e2e';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    branchesService = moduleFixture.get<BranchesService>(BranchesService);
    studentsService = moduleFixture.get<StudentsService>(StudentsService);
    hostelsService = moduleFixture.get<HostelsService>(HostelsService);
    financeService = moduleFixture.get<FinanceService>(FinanceService);
    leaveService = moduleFixture.get<LeaveService>(LeaveService);
    employeesService = moduleFixture.get<EmployeesService>(EmployeesService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    const branchA = await branchesService.create({
      name: 'E2E Branch A',
      code: `E2E-A-${Date.now()}`,
    } as any);
    trackId('branch', branchA.id);
    branchAId = branchA.id;

    const branchB = await branchesService.create({
      name: 'E2E Branch B',
      code: `E2E-B-${Date.now()}`,
    } as any);
    trackId('branch', branchB.id);
    branchBId = branchB.id;

    const superAdmin = await usersService.createUser({
      email: `sa-critical-${Date.now()}@test.com`,
      password: 'password123',
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
    });
    trackId('user', superAdmin.id);
    superAdminUserId = superAdmin.id;
    superAdminToken = jwtService.sign({
      sub: superAdmin.id,
      email: superAdmin.email,
      role: superAdmin.role,
      branchId: superAdmin.branchId,
    });

    const adminA = await usersService.createUser({
      email: `admin-a-critical-${Date.now()}@test.com`,
      password: 'password123',
      firstName: 'BranchA',
      lastName: 'Admin',
      role: UserRole.BRANCH_ADMIN,
    } as any);
    trackId('user', adminA.id);
    branchAAdminUserId = adminA.id;
    branchAToken = jwtService.sign({
      sub: adminA.id,
      email: adminA.email,
      role: adminA.role,
      branchId: (adminA as any).branchId,
    });

    const adminB = await usersService.createUser({
      email: `admin-b-critical-${Date.now()}@test.com`,
      password: 'password123',
      firstName: 'BranchB',
      lastName: 'Admin',
      role: UserRole.BRANCH_ADMIN,
    } as any);
    trackId('user', adminB.id);
    branchBAdminUserId = adminB.id;
    branchBToken = jwtService.sign({
      sub: adminB.id,
      email: adminB.email,
      role: adminB.role,
      branchId: (adminB as any).branchId,
    });
  }, 30000);

  afterAll(async () => {
    for (const item of createdIds.reverse()) {
      try {
        switch (item.type) {
          case 'hostelAllocation':
            await prismaService.hostelAllocation.delete({ where: { id: item.id } }).catch(() => {});
            break;
          case 'bed':
            await prismaService.bed.delete({ where: { id: item.id } }).catch(() => {});
            break;
          case 'room':
            await prismaService.room.delete({ where: { id: item.id } }).catch(() => {});
            break;
          case 'hostel':
            await prismaService.hostel.delete({ where: { id: item.id } }).catch(() => {});
            break;
          case 'invoice':
            await prismaService.invoice.delete({ where: { id: item.id } }).catch(() => {});
            break;
          case 'payment':
            await prismaService.payment.delete({ where: { id: item.id } }).catch(() => {});
            break;
          case 'feeCategory':
            await prismaService.feeCategory.delete({ where: { id: item.id } }).catch(() => {});
            break;
          case 'student':
            await prismaService.student.delete({ where: { id: item.id } }).catch(() => {});
            break;
          case 'leaveRequest':
            await prismaService.leaveRequest.delete({ where: { id: item.id } }).catch(() => {});
            break;
          case 'staff':
            await prismaService.staff.delete({ where: { id: item.id } }).catch(() => {});
            break;
          case 'user':
            await prismaService.user.delete({ where: { id: item.id } }).catch(() => {});
            break;
          case 'branch':
            await prismaService.branch.delete({ where: { id: item.id } }).catch(() => {});
            break;
        }
      } catch {
        // cleanup best-effort
      }
    }
    await app.close();
  }, 30000);

  describe('Hostel Allocation Flow', () => {
    it('should allocate a bed and verify student has an active allocation', async () => {
      const student = await studentsService.create(
        {
          email: `student-hostel-${Date.now()}@test.com`,
          password: 'password123',
          firstName: 'HostelTest',
          lastName: 'Student',
          branchId: branchAId,
        } as any,
        { userId: superAdminUserId, branchId: branchAId, isSuperAdmin: true, role: UserRole.SUPER_ADMIN },
      );
      trackId('student', student.student.id);
      studentIdA = student.student.id;

      const hostel = await hostelsService.createHostel(
        { name: 'E2E Hostel', type: 'BOYS', branchId: branchAId } as any,
        { userId: superAdminUserId, branchId: branchAId, isSuperAdmin: true, role: UserRole.SUPER_ADMIN },
      );
      trackId('hostel', hostel.id);

      const room = await hostelsService.createRoom(
        { number: '101', floor: 1, capacity: 2, hostelId: hostel.id } as any,
        { userId: superAdminUserId, branchId: branchAId, isSuperAdmin: true, role: UserRole.SUPER_ADMIN },
      );
      if (!room) throw new Error('Failed to create room');
      trackId('room', room.id);

      if (!room?.beds) throw new Error('Room has no beds');
      const bed = room.beds[0];
      trackId('bed', bed.id);

      const allocation = await hostelsService.allocateBed(
        { studentId: student.student.id, bedId: bed.id, checkInDate: new Date().toISOString() } as any,
        { userId: superAdminUserId, branchId: branchAId, isSuperAdmin: true, role: UserRole.SUPER_ADMIN },
      );
      trackId('hostelAllocation', allocation.id);

      expect(allocation.studentId).toBe(student.student.id);
      expect(allocation.isActive).toBe(true);

      const updatedBed = await prismaService.bed.findUnique({ where: { id: bed.id } });
      expect(updatedBed?.status).toBe(BedStatus.OCCUPIED);
    });

    it('should enforce uniqueness constraint on active allocations', async () => {
      const student = await studentsService.create(
        {
          email: `student-unique-${Date.now()}@test.com`,
          password: 'password123',
          firstName: 'UniqueTest',
          lastName: 'Student',
          branchId: branchAId,
        } as any,
        { userId: superAdminUserId, branchId: branchAId, isSuperAdmin: true, role: UserRole.SUPER_ADMIN },
      );
      trackId('student', student.student.id);

      const hostel = await hostelsService.createHostel(
        { name: 'E2E Hostel Unique', type: 'BOYS', branchId: branchAId } as any,
        { userId: superAdminUserId, branchId: branchAId, isSuperAdmin: true, role: UserRole.SUPER_ADMIN },
      );
      trackId('hostel', hostel.id);

      const room = await hostelsService.createRoom(
        { number: '201', floor: 2, capacity: 2, hostelId: hostel.id } as any,
        { userId: superAdminUserId, branchId: branchAId, isSuperAdmin: true, role: UserRole.SUPER_ADMIN },
      );
      if (!room) throw new Error('Failed to create room');
      trackId('room', room.id);

      if (!room?.beds || room.beds.length < 2) throw new Error('Room needs at least 2 beds');
      const bed1 = room.beds[0];
      const bed2 = room.beds[1];
      trackId('bed', bed1.id);
      trackId('bed', bed2.id);

      await hostelsService.allocateBed(
        { studentId: student.student.id, bedId: bed1.id, checkInDate: new Date().toISOString() } as any,
        { userId: superAdminUserId, branchId: branchAId, isSuperAdmin: true, role: UserRole.SUPER_ADMIN },
      );

      const dbAllocation = await prismaService.hostelAllocation.findFirst({
        where: { studentId: student.student.id, isActive: true },
      });
      trackId('hostelAllocation', dbAllocation!.id);

      await expect(
        hostelsService.allocateBed(
          { studentId: student.student.id, bedId: bed2.id, checkInDate: new Date().toISOString() } as any,
          { userId: superAdminUserId, branchId: branchAId, isSuperAdmin: true, role: UserRole.SUPER_ADMIN },
        ),
      ).rejects.toThrow();
    });
  });

  describe('Cross-Branch Data Isolation', () => {
    it('should prevent Branch B admin from reading Branch A student data', async () => {
      const student = await studentsService.create(
        {
          email: `student-isolated-${Date.now()}@test.com`,
          password: 'password123',
          firstName: 'Isolated',
          lastName: 'Student',
          branchId: branchAId,
        } as any,
        { userId: superAdminUserId, branchId: branchAId, isSuperAdmin: true, role: UserRole.SUPER_ADMIN },
      );
      trackId('student', student.student.id);

      const response = await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${branchBToken}`)
        .expect(200);

      const studentIds = (response.body as any[]).map((s: any) => s.id);
      expect(studentIds).not.toContain(student.student.id);
    });

    it('should allow SuperAdmin to see all branch data', async () => {
      const response = await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Leave Approval Flow', () => {
    it('should apply leave, approve it, and verify status changed', async () => {
      const staffUser = await usersService.createUser({
        email: `staff-leave-${Date.now()}@test.com`,
        password: 'password123',
        firstName: 'LeaveTest',
        lastName: 'Staff',
        role: UserRole.TEACHER,
      } as any);
      trackId('user', staffUser.id);

      const staffRecord = await employeesService.createEmployee({
        userId: staffUser.id,
        branchId: branchAId,
      } as any);
      trackId('staff', (staffRecord as any).id);

      const leaveRequest = await leaveService.applyLeave(
        (staffRecord as any).id,
        {
          type: 'SICK',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
          reason: 'Medical appointment',
        } as any,
        branchAId,
      );
      trackId('leaveRequest', leaveRequest.id);

      expect(leaveRequest.status).toBe('PENDING');

const updated = await leaveService.updateLeaveStatus(
         leaveRequest.id,
         { status: 'APPROVED' } as any,
       );

      expect(updated.status).toBe('APPROVED');
    });
  });

  describe('Payment Recording Flow', () => {
    it('should create an invoice, record payment, and verify balance updated', async () => {
      const student = await studentsService.create(
        {
          email: `student-payment-${Date.now()}@test.com`,
          password: 'password123',
          firstName: 'Payment',
          lastName: 'Student',
          branchId: branchAId,
        } as any,
        { userId: superAdminUserId, branchId: branchAId, isSuperAdmin: true, role: UserRole.SUPER_ADMIN },
      );
      trackId('student', student.student.id);

      const category = await prismaService.feeCategory.create({
        data: { name: 'Tuition Fee', branchId: branchAId },
      });
      trackId('feeCategory', category.id);

      const invoice = await financeService.createInvoice(
        {
          studentId: student.student.id,
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
          branchId: branchAId,
          items: [{ categoryId: category.id, amount: 50000 }],
        } as any,
        { userId: superAdminUserId, branchId: branchAId, isSuperAdmin: true, role: UserRole.SUPER_ADMIN },
      );
      trackId('invoice', invoice.id);

      expect(invoice.totalAmount).toBe(50000);
      expect(invoice.balance).toBe(50000);
      expect(invoice.status).toBe(InvoiceStatus.UNPAID);

      const payment = await financeService.recordPayment(
        {
          invoiceId: invoice.id,
          amount: 30000,
          method: PaymentMethod.CASH,
        } as any,
        { userId: superAdminUserId, branchId: branchAId, isSuperAdmin: true, role: UserRole.SUPER_ADMIN },
      );
      trackId('payment', payment.id);

      expect(payment.amount).toBe(30000);

      const updatedInvoice = await prismaService.invoice.findUnique({
        where: { id: invoice.id },
      });
      expect(updatedInvoice?.balance).toBe(20000);
      expect(updatedInvoice?.status).toBe(InvoiceStatus.PARTIALLY_PAID);
    });
  });
});
