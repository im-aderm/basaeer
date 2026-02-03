
import { PrismaClient, UserRole, Term, ExamTerm, AttendanceStatus, HostelType, BedStatus, PaymentMethod, PaymentStatus, InvoiceStatus, QuestionType, ExamStatus, AttemptStatus } from '../src/generated/client/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    console.log('Starting seeding...');

    const saltRounds = 10;
    const defaultPassword = 'password123';
    const hashedDefaultPassword = await bcrypt.hash(defaultPassword, saltRounds);

    // 1. Branch
    const branch = await prisma.branch.upsert({
        where: { code: 'MAIN001' },
        update: {},
        create: {
            name: 'Main Campus',
            code: 'MAIN001',
            address: '123 Education Street, City Center',
            phone: '08012345678',
            email: 'main@basaeer.com',
        },
    });
    console.log(`Branch ensured: ${branch.name}`);

    // 2. Academic Session
    const session = await prisma.academicSession.create({
        data: {
            name: `2024/2025-${Date.now()}`,
            startDate: new Date('2024-09-01'),
            endDate: new Date('2025-07-31'),
            isActive: true,
        },
    });
    console.log(`Academic Session created: ${session.name}`);

    // 3. Departments & Designations
    const academicDept = await prisma.department.create({
        data: { name: 'Academic-' + Date.now(), branchId: branch.id },
    });
    const accountsDept = await prisma.department.create({
        data: { name: 'Accounts-' + Date.now(), branchId: branch.id },
    });

    const teacherDesignation = await prisma.designation.create({
        data: { name: 'Senior Teacher-' + Date.now(), branchId: branch.id },
    });
    const accountantDesignation = await prisma.designation.create({
        data: { name: 'Chief Accountant-' + Date.now(), branchId: branch.id },
    });

    // 4. Super Admin
    const superAdminEmail = 'superadmin@basaeer.com';
    const superAdminHashedPassword = await bcrypt.hash('admin123', saltRounds);
    await prisma.user.upsert({
        where: { email: superAdminEmail },
        update: {},
        create: {
            email: superAdminEmail,
            password: superAdminHashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: UserRole.SUPER_ADMIN,
            branchId: branch.id,
        },
    });
    console.log('Super Admin ensured');

    // 5. Academic Setup (Classes, Sections, Subjects)
    const grade1 = await prisma.class.create({
        data: { name: 'Grade 1-' + Date.now(), gradeLevel: 1, branchId: branch.id },
    });
    const sectionA = await prisma.section.create({
        data: { name: 'A', classId: grade1.id },
    });

    const math = await prisma.subject.create({
        data: { name: 'Mathematics-' + Date.now(), code: 'MATH101', branchId: branch.id },
    });
    const english = await prisma.subject.create({
        data: { name: 'English-' + Date.now(), code: 'ENG101', branchId: branch.id },
    });

    // 6. Staff
    const teacherUser = await prisma.user.create({
        data: {
            email: `teacher-${Date.now()}@basaeer.com`,
            password: hashedDefaultPassword,
            firstName: 'Musa',
            lastName: 'Teacher',
            role: UserRole.TEACHER,
            branchId: branch.id,
        },
    });
    await prisma.staff.create({
        data: {
            userId: teacherUser.id,
            departmentId: academicDept.id,
            designationId: teacherDesignation.id,
            subjects: { connect: [{ id: math.id }, { id: english.id }] },
        },
    });

    const accountantUser = await prisma.user.create({
        data: {
            email: `accountant-${Date.now()}@basaeer.com`,
            password: hashedDefaultPassword,
            firstName: 'Zainab',
            lastName: 'Accountant',
            role: UserRole.ACCOUNTANT,
            branchId: branch.id,
        },
    });
    await prisma.staff.create({
        data: {
            userId: accountantUser.id,
            departmentId: accountsDept.id,
            designationId: accountantDesignation.id,
        },
    });

    // 7. Parents & Students (Multiple)
    for (let i = 1; i <= 3; i++) {
        const parentUser = await prisma.user.create({
            data: {
                email: `parent${i}-${Date.now()}@basaeer.com`,
                password: hashedDefaultPassword,
                firstName: `Parent${i}`,
                lastName: 'Linked',
                role: UserRole.PARENT,
                branchId: branch.id,
                phone: `080${i}8765432`,
            },
        });

        for (let j = 1; j <= 2; j++) {
            const studentUser = await prisma.user.create({
                data: {
                    email: `student${i}_${j}-${Date.now()}@basaeer.com`,
                    password: hashedDefaultPassword,
                    firstName: `Student${i}_${j}`,
                    lastName: `Child of Parent${i}`,
                    role: UserRole.STUDENT,
                    branchId: branch.id,
                },
            });

            await prisma.student.create({
                data: {
                    userId: studentUser.id,
                    firstName: studentUser.firstName,
                    lastName: studentUser.lastName,
                    branchId: branch.id,
                    classId: grade1.id,
                    sectionId: sectionA.id,
                    parentId: parentUser.id,
                    dob: new Date('2015-05-20'),
                },
            });
        }
    }
    console.log('Parents and Students created');

    // 8. Finance (Categories, Structures, Invoices)
    const tuitionCategory = await prisma.feeCategory.create({
        data: { name: 'Tuition Fee-' + Date.now(), branchId: branch.id },
    });
    await prisma.feeStructure.create({
        data: { amount: 50000, categoryId: tuitionCategory.id, classId: grade1.id, branchId: branch.id },
    });

    // 11. Inventory
    const invCat = await prisma.inventoryCategory.create({
        data: { name: 'Stationery-' + Date.now(), branchId: branch.id },
    });
    const invUnit = await prisma.inventoryUnit.create({
        data: { name: 'Box', branchId: branch.id },
    });
    const invStore = await prisma.inventoryStore.create({
        data: { name: 'Main Store-' + Date.now(), branchId: branch.id },
    });
    await prisma.inventoryProduct.create({
        data: {
            name: 'Pencils-' + Date.now(),
            categoryId: invCat.id,
            unitId: invUnit.id,
            storeId: invStore.id,
            branchId: branch.id,
            stock: 100,
        },
    });

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
