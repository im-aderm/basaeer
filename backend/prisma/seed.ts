import { PrismaClient, UserRole, AttendanceStatus, Term, ExamTerm, AcademicExamStatus, ResultApprovalStatus, RankingScope, TranscriptStatus, HostelType, BedStatus, PaymentMethod, PaymentStatus, InvoiceStatus, QuestionType, ExamStatus, AttemptStatus, VoucherStatus, StaffStatus, BorrowStatus, PayrollStatus, LeaveStatus, AdvanceSalaryStatus, AdmissionStatus, IssueStatus, SubmissionStatus, IdCardStatusEnum, MaintenanceStatus, MaintenancePriority, BookCopyStatus, ReservationStatus, HostelLeaveStatus, EventParticipationStatus } from '../src/generated/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  // 1. Reset Database
  console.log('Resetting database...');
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log('Error during truncate, falling back to manual deletion...');
    // Fallback if truncate fails (though it shouldn't on Postgres)
  }

  const passwordHash = await bcrypt.hash('Password123!', 8);

  // 2. Create Main Branch
  console.log('Seeding Branch...');
  const branch = await prisma.branch.create({
    data: {
      name: 'Basaeer Main Campus',
      code: 'BMC001',
      address: '123 Education Way, Abuja',
      phone: '+2348001234567',
      email: 'main@basaeer.edu.ng',
      isActive: true,
    },
  });

  // 3. Create Users for all Roles
  console.log('Seeding Users and Roles...');
  const roles = Object.values(UserRole);
  const users: Record<string, any> = {};

  for (const role of roles) {
    const email = `${role.toLowerCase().replace('_', '.')}@basaeer.com`;
    users[role] = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        firstName: role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' '),
        lastName: 'Admin',
        role: role,
        branchId: branch.id,
        isActive: true,
      },
    });
  }

  // 4. Academic Foundational Data
  console.log('Seeding Academic Sessions, Classes, and Subjects...');
  const session = await prisma.academicSession.create({
    data: {
      name: '2025/2026 Academic Session',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-07-31'),
      isActive: true,
      branchId: branch.id,
    },
  });

  const department = await prisma.department.create({
    data: {
      name: 'Sciences',
      branchId: branch.id,
    },
  });

  const designation = await prisma.designation.create({
    data: {
      name: 'Senior Teacher',
      branchId: branch.id,
    },
  });

  // Create Staff entry for the Teacher user
  const teacherStaff = await prisma.staff.create({
    data: {
      userId: users[UserRole.TEACHER].id,
      departmentId: department.id,
      designationId: designation.id,
      status: StaffStatus.ACTIVE,
    },
  });

  const classSS1 = await prisma.class.create({
    data: {
      name: 'SS1',
      gradeLevel: 10,
      branchId: branch.id,
      classTeacherId: teacherStaff.id,
    },
  });

  const sectionA = await prisma.section.create({
    data: {
      name: 'A',
      classId: classSS1.id,
    },
  });

  const subjectMath = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      code: 'MATH101',
      branchId: branch.id,
    },
  });

  // 5. Students and Parents
  console.log('Seeding Students and Parents...');
  const parent = users[UserRole.PARENT];
  const studentUser = users[UserRole.STUDENT];

  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      firstName: 'John',
      lastName: 'Doe',
      dob: new Date('2010-05-15'),
      branchId: branch.id,
      classId: classSS1.id,
      sectionId: sectionA.id,
      parentId: parent.id,
      nationality: 'Nigerian',
      stateOfOrigin: 'Lagos',
    },
  });

  // 6. Attendance
  console.log('Seeding Attendance...');
  const attendanceSession = await prisma.attendanceSession.create({
    data: {
      name: 'Morning Session',
      date: new Date(),
      classId: classSS1.id,
      sectionId: sectionA.id,
      branchId: branch.id,
    },
  });

  await prisma.attendance.create({
    data: {
      date: new Date(),
      status: AttendanceStatus.PRESENT,
      studentId: student.id,
      sessionId: attendanceSession.id,
      branchId: branch.id,
    },
  });

  // 7. Exams and Assessments
  console.log('Seeding Exams and Assessments...');
  const exam = await prisma.exam.create({
    data: {
      title: 'First Term Examination',
      status: AcademicExamStatus.PUBLISHED,
      branchId: branch.id,
      sessionId: session.id,
      term: Term.FIRST,
    },
  });

  const assessmentComponent = await prisma.assessmentComponent.create({
    data: {
      name: 'Continuous Assessment 1',
      component: 'CA1',
      weight: 20,
      maxScore: 20,
      branchId: branch.id,
    },
  });

  const record = await prisma.assessmentRecord.create({
    data: {
      studentId: student.id,
      subjectId: subjectMath.id,
      sectionId: sectionA.id,
      sessionId: session.id,
      term: Term.FIRST,
      examTerm: ExamTerm.FIRST_TERM,
      branchId: branch.id,
      total: 75,
      grade: 'B',
    },
  });

  await prisma.assessmentScore.create({
    data: {
      score: 15,
      studentId: student.id,
      componentId: assessmentComponent.id,
      recordId: record.id,
    },
  });

  // 8. Finance
  console.log('Seeding Finance data...');
  const feeCategory = await prisma.feeCategory.create({
    data: {
      name: 'Tuition Fee',
      branchId: branch.id,
    },
  });

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-001',
      dueDate: new Date('2025-10-01'),
      totalAmount: 50000,
      balance: 50000,
      status: InvoiceStatus.UNPAID,
      studentId: student.id,
      branchId: branch.id,
    },
  });

  await prisma.invoiceItem.create({
    data: {
      amount: 50000,
      invoiceId: invoice.id,
      categoryId: feeCategory.id,
    },
  });

  const expenseCategory = await prisma.expenseCategory.create({
    data: {
      name: 'Office Supplies',
      branchId: branch.id,
    },
  });

  await prisma.voucher.create({
    data: {
      voucherNumber: 'VOUCH-001',
      date: new Date(),
      amount: 5000,
      description: 'Buying stationery',
      expenseCategoryId: expenseCategory.id,
      paidTo: 'Top Stationery Ltd',
      branchId: branch.id,
      status: VoucherStatus.APPROVED,
      approvedByUserId: users[UserRole.ACCOUNTANT].id,
    },
  });

  // 9. Logistics (Hostel and Transport)
  console.log('Seeding Logistics...');
  const hostel = await prisma.hostel.create({
    data: {
      name: 'Main Boys Hostel',
      type: HostelType.BOYS,
      branchId: branch.id,
    },
  });

  const room = await prisma.room.create({
    data: {
      number: '101',
      floor: 1,
      capacity: 4,
      hostelId: hostel.id,
    },
  });

  const bed = await prisma.bed.create({
    data: {
      name: 'Bed A',
      roomId: room.id,
    },
  });

  await prisma.hostelAllocation.create({
    data: {
      checkInDate: new Date(),
      studentId: student.id,
      bedId: bed.id,
      branchId: branch.id,
    },
  });

  const vehicle = await prisma.vehicle.create({
    data: {
      registrationNumber: 'ABJ-123-XY',
      model: 'Toyota Coaster',
      capacity: 30,
      driverName: 'Mustapha Driver',
      branchId: branch.id,
    },
  });

  const route = await prisma.transportRoute.create({
    data: {
      name: 'Garki Route',
      startPoint: 'School',
      endPoint: 'Garki',
      branchId: branch.id,
    },
  });

  await prisma.transportAssignment.create({
    data: {
      studentId: student.id,
      vehicleId: vehicle.id,
      routeId: route.id,
    },
  });

  // 10. Library
  console.log('Seeding Library...');
  const book = await prisma.book.create({
    data: {
      title: 'Intro to Mathematics',
      author: 'K.A. Stroud',
      category: 'Science',
      branchId: branch.id,
      quantity: 5,
      available: 5,
    },
  });

  const bookCopy = await prisma.bookCopy.create({
    data: {
      barcode: 'BOOK001-A',
      accessionNumber: 'ACC001',
      bookId: book.id,
      branchId: branch.id,
    },
  });

  await prisma.borrowRecord.create({
    data: {
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      bookId: book.id,
      bookCopyId: bookCopy.id,
      studentId: student.id,
      branchId: branch.id,
    },
  });

  // 11. Inventory
  console.log('Seeding Inventory...');
  const invCategory = await prisma.inventoryCategory.create({
    data: {
      name: 'Stationery',
      branchId: branch.id,
    },
  });

  const invUnit = await prisma.inventoryUnit.create({
    data: {
      name: 'Pieces',
      branchId: branch.id,
    },
  });

  const store = await prisma.inventoryStore.create({
    data: {
      name: 'Main Store',
      branchId: branch.id,
    },
  });

  await prisma.inventoryProduct.create({
    data: {
      name: 'Blue Pen',
      categoryId: invCategory.id,
      unitId: invUnit.id,
      storeId: store.id,
      stock: 100,
      costPrice: 50,
      sellingPrice: 100,
      branchId: branch.id,
    },
  });

  // 12. Front Office
  console.log('Seeding Front Office logs...');
  await prisma.visitorLog.create({
    data: {
      purpose: 'Meeting Principal',
      name: 'Mr. Visitor',
      phone: '08011112222',
      branchId: branch.id,
    },
  });

  await prisma.complaint.create({
    data: {
      complaintType: 'Academic',
      name: 'Aggrieved Parent',
      phone: '08033334444',
      description: 'My child is not getting enough homework.',
      branchId: branch.id,
    },
  });

  // 13. LMS
  console.log('Seeding LMS (Assignments, Resources)...');
  const assignment = await prisma.assignment.create({
    data: {
      title: 'Quadratic Equations Homework',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      subjectId: subjectMath.id,
      sectionId: sectionA.id,
      teacherId: teacherStaff.id,
      branchId: branch.id,
    },
  });

  await prisma.submission.create({
    data: {
      assignmentId: assignment.id,
      studentId: student.id,
      branchId: branch.id,
      status: SubmissionStatus.SUBMITTED,
    },
  });

  const attachmentCategory = await prisma.attachmentCategory.create({
    data: {
      name: 'Mathematics Materials',
      branchId: branch.id,
    },
  });

  await prisma.digitalResource.create({
    data: {
      title: 'Algebra 101 Notes',
      fileUrl: 'https://example.com/notes.pdf',
      fileType: 'pdf',
      categoryId: attachmentCategory.id,
      sessionId: session.id,
      uploaderId: teacherStaff.id,
      branchId: branch.id,
    },
  });

  // ── Seed default custom roles ───────────────────────────────────────────
  console.log('Seeding default custom roles...');
  const roleEnumValues = [
    'SUPER_ADMIN',
    'BRANCH_ADMIN',
    'TEACHER',
    'HOD',
    'PRINCIPAL',
    'EXAM_OFFICER',
    'ACADEMIC_OFFICER',
    'ACCOUNTANT',
    'HR',
    'LIBRARIAN',
    'HOSTEL_ADMIN',
    'TRANSPORT_OFFICER',
    'STUDENT',
    'PARENT',
    'RECEPTIONIST',
  ];
  for (const rv of roleEnumValues) {
    await prisma.role.upsert({
      where: { slug: rv.toLowerCase() },
      update: {},
      create: {
        name: rv.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        slug: rv.toLowerCase(),
        description: `Default ${rv.replace(/_/g, ' ').toLowerCase()} role`,
        isSystem: true,
        branchId: null,
      },
    });
  }
  console.log(`Seeded ${roleEnumValues.length} default roles.`);

  // ── Seed role permissions from existing enum-based permissions ──────────
  console.log('Copying existing permissions to custom roles...');
  const existingPerms = await prisma.rolePermission.findMany();
  for (const perm of existingPerms) {
    const roleSlug = perm.role.toLowerCase();
    const role = await prisma.role.findUnique({ where: { slug: roleSlug } });
    if (role) {
      await prisma.customRolePermission.upsert({
        where: { roleId_module_action: { roleId: role.id, module: perm.module, action: perm.action } },
        update: { isAllowed: perm.isAllowed },
        create: {
          roleId: role.id,
          module: perm.module,
          action: perm.action,
          isAllowed: perm.isAllowed,
        },
      });
    }
  }
  console.log(`Copied ${existingPerms.length} permissions to custom roles.`);

  console.log('\nSeed process completed successfully!');
  console.log('--- Login Credentials ---');
  for (const role of roles) {
    console.log(`${role.padEnd(20)}: ${role.toLowerCase().replace('_', '.')}@basaeer.com / Password123!`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
