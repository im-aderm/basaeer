import 'dotenv/config';
import { PrismaClient, UserRole } from '../src/generated/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BRANCH_ID = 'cf090538-ae20-47dc-8d54-100af8decfc7';
const PASSWORD = 'Password123!';
const BCRYPT_ROUNDS = 12;

const roles: Array<{ email: string; role: UserRole; firstName: string; lastName: string; isStaff: boolean }> = [
  { email: 'branchadmin@basaeer.com', role: UserRole.BRANCH_ADMIN, firstName: 'Branch', lastName: 'Admin', isStaff: true },
  { email: 'teacher@basaeer.com', role: UserRole.TEACHER, firstName: 'Ahmad', lastName: 'Teacher', isStaff: true },
  { email: 'hod@basaeer.com', role: UserRole.HOD, firstName: 'Fatima', lastName: 'HOD', isStaff: true },
  { email: 'principal@basaeer.com', role: UserRole.PRINCIPAL, firstName: 'Umar', lastName: 'Principal', isStaff: true },
  { email: 'examofficer@basaeer.com', role: UserRole.EXAM_OFFICER, firstName: 'Khadija', lastName: 'Exam', isStaff: true },
  { email: 'academicofficer@basaeer.com', role: UserRole.ACADEMIC_OFFICER, firstName: 'Bilal', lastName: 'Academic', isStaff: true },
  { email: 'accountant@basaeer.com', role: UserRole.ACCOUNTANT, firstName: 'Zainab', lastName: 'Accountant', isStaff: true },
  { email: 'hr@basaeer.com', role: UserRole.HR, firstName: 'Yusuf', lastName: 'HR', isStaff: true },
  { email: 'librarian@basaeer.com', role: UserRole.LIBRARIAN, firstName: 'Aisha', lastName: 'Librarian', isStaff: true },
  { email: 'hosteladmin@basaeer.com', role: UserRole.HOSTEL_ADMIN, firstName: 'Ibrahim', lastName: 'Hostel', isStaff: true },
  { email: 'transport@basaeer.com', role: UserRole.TRANSPORT_OFFICER, firstName: 'Khalid', lastName: 'Transport', isStaff: true },
  { email: 'receptionist@basaeer.com', role: UserRole.RECEPTIONIST, firstName: 'Mariam', lastName: 'Reception', isStaff: true },
  { email: 'student@basaeer.com', role: UserRole.STUDENT, firstName: 'Abdullah', lastName: 'Student', isStaff: false },
  { email: 'parent@basaeer.com', role: UserRole.PARENT, firstName: 'Abdullah', lastName: 'Parent', isStaff: false },
];

async function main() {
  console.log('Seeding all roles for branch', BRANCH_ID);
  const hash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);
  const branch = await prisma.branch.findUnique({ where: { id: BRANCH_ID } });
  if (!branch) throw new Error('Branch not found: ' + BRANCH_ID);
  console.log(`Branch: ${branch.name} (${branch.code})`);

  // Ensure a class exists for student assignment
  let cls = await prisma.class.findFirst({ where: { branchId: BRANCH_ID } });
  if (!cls) {
    cls = await prisma.class.create({ data: { name: 'JSS 1', branchId: BRANCH_ID } });
    console.log('Created class', cls.name);
  }
  let section = await prisma.section.findFirst({ where: { classId: cls.id } });
  if (!section) {
    section = await prisma.section.create({ data: { name: 'A', classId: cls.id } });
    console.log('Created section', section.name);
  }

  for (const r of roles) {
    const existing = await prisma.user.findUnique({ where: { email: r.email } });
    let user: any;
    if (existing) {
      user = await prisma.user.update({
        where: { email: r.email },
        data: { password: hash, firstName: r.firstName, lastName: r.lastName, role: r.role, branchId: BRANCH_ID, isActive: true },
      });
      console.log(`Updated ${r.role}: ${r.email}`);
    } else {
      user = await prisma.user.create({
        data: {
          email: r.email,
          password: hash,
          firstName: r.firstName,
          lastName: r.lastName,
          role: r.role,
          branchId: BRANCH_ID,
          isActive: true,
        },
      });
      console.log(`Created ${r.role}: ${r.email}`);
    }

    if (r.isStaff) {
      const staffExists = await prisma.staff.findUnique({ where: { userId: user.id } });
      if (!staffExists) {
        await prisma.staff.create({ data: { userId: user.id, status: 'ACTIVE' } });
        console.log(`  -> Staff record for ${r.email}`);
      } else {
        console.log(`  -> Staff already exists for ${r.email}`);
      }
    }
  }

  // Handle STUDENT + PARENT linkage
  const parentUser = await prisma.user.findUnique({ where: { email: 'parent@basaeer.com' } });
  const studentUser = await prisma.user.findUnique({ where: { email: 'student@basaeer.com' } });
  if (parentUser && studentUser) {
    // Create or update Student record for student@basaeer.com
    const existingStudent = await prisma.student.findFirst({ where: { userId: studentUser.id } });
    if (!existingStudent) {
      const student = await prisma.student.create({
        data: {
          userId: studentUser.id,
          firstName: 'Abdullah',
          lastName: 'Student',
          branchId: BRANCH_ID,
          classId: cls.id,
          sectionId: section.id,
          parentId: parentUser.id,
          admissionNumber: `BMS-${new Date().getFullYear()}-STU001`,
          gender: 'Male',
          enrollmentStatus: 'ACTIVE',
          admissionDate: new Date(),
        },
      });
      console.log(`Created Student record for student@basaeer.com -> ${student.admissionNumber}`);
    } else {
      await prisma.student.update({
        where: { id: existingStudent.id },
        data: { parentId: parentUser.id, branchId: BRANCH_ID, classId: cls.id, sectionId: section.id },
      });
      console.log(`Linked existing Student to parent`);
    }
  }

  // Also ensure a second student for transport/hostel testing if needed
  const count = await prisma.user.count({});
  console.log(`\nTotal users: ${count}`);
  console.log(`\nAll logins use password: ${PASSWORD}`);
  console.log('Done');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
