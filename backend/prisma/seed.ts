
import { PrismaClient, UserRole } from '../src/generated/client/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

/** findOrCreate: reusable helper so seed is idempotent on re-runs */
async function findOrCreate<T>(
    findFn: () => Promise<T | null>,
    createFn: () => Promise<T>
): Promise<T> {
    const existing = await findFn();
    if (existing) return existing;
    return createFn();
}

async function main() {
    console.log('Starting seeding...');

    const saltRounds = 10;

    // ── Use env vars for passwords — never hard-code credentials ── //
    const defaultPassword = process.env.SEED_DEFAULT_PASSWORD;
    const superAdminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (!defaultPassword || !superAdminPassword) {
        throw new Error(
            '❌ SEED_DEFAULT_PASSWORD and SEED_ADMIN_PASSWORD must be set in .env before seeding!\n' +
            '   Check .env.example for the required variables.'
        );
    }

    const hashedDefaultPassword = await bcrypt.hash(defaultPassword, saltRounds);
    const hashedSuperAdminPassword = await bcrypt.hash(superAdminPassword, saltRounds);

    // 1. Branch
    const branch = await findOrCreate(
        () => prisma.branch.findFirst({ where: { code: 'MAIN001' } }),
        () => prisma.branch.create({
            data: {
                name: 'Main Campus',
                code: 'MAIN001',
                address: '12 Basaeer Avenue, Wuse II, Abuja, Nigeria',
                phone: '+2348012345678',
                email: 'admissions@basaeer.edu.ng',
            },
        })
    );
    console.log(`Branch ensured: ${branch.name}`);

    // 2. Academic Session
    const sessionName = '2024/2025';
    const session = await findOrCreate(
        () => prisma.academicSession.findFirst({ where: { name: sessionName } }),
        () => prisma.academicSession.create({
            data: {
                name: sessionName,
                startDate: new Date('2024-09-01'),
                endDate: new Date('2025-07-31'),
                isActive: true,
            },
        })
    );
    console.log(`Academic Session ensured: ${session.name}`);

    // 3. Departments
    const academicDept = await findOrCreate(
        () => prisma.department.findFirst({ where: { name: 'Academic', branchId: branch.id } }),
        () => prisma.department.create({ data: { name: 'Academic', branchId: branch.id } })
    );
    const accountsDept = await findOrCreate(
        () => prisma.department.findFirst({ where: { name: 'Accounts', branchId: branch.id } }),
        () => prisma.department.create({ data: { name: 'Accounts', branchId: branch.id } })
    );

    // 4. Designations
    const teacherDesignation = await findOrCreate(
        () => prisma.designation.findFirst({ where: { name: 'Senior Teacher', branchId: branch.id } }),
        () => prisma.designation.create({ data: { name: 'Senior Teacher', branchId: branch.id } })
    );
    const accountantDesignation = await findOrCreate(
        () => prisma.designation.findFirst({ where: { name: 'Chief Accountant', branchId: branch.id } }),
        () => prisma.designation.create({ data: { name: 'Chief Accountant', branchId: branch.id } })
    );

    // 5. Super Admin
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@basaeer.com';
    const superAdmin = await findOrCreate(
        () => prisma.user.findUnique({ where: { email: superAdminEmail } }),
        () => prisma.user.create({
            data: {
                email: superAdminEmail,
                password: hashedSuperAdminPassword,
                firstName: 'Super',
                lastName: 'Admin',
                role: UserRole.SUPER_ADMIN,
                branchId: branch.id,
            },
        })
    );
    console.log(`Super Admin ensured: ${superAdmin.email}`);

    // 6. Academic Setup
    const grade1 = await findOrCreate(
        () => prisma.class.findFirst({ where: { name: 'Grade 1', branchId: branch.id } }),
        () => prisma.class.create({ data: { name: 'Grade 1', gradeLevel: 1, branchId: branch.id } })
    );
    const sectionA = await findOrCreate(
        () => prisma.section.findFirst({ where: { name: 'A', classId: grade1.id } }),
        () => prisma.section.create({ data: { name: 'A', classId: grade1.id } })
    );
    const math = await findOrCreate(
        () => prisma.subject.findFirst({ where: { name: 'Mathematics', branchId: branch.id } }),
        () => prisma.subject.create({ data: { name: 'Mathematics', code: 'MATH101', branchId: branch.id } })
    );
    const english = await findOrCreate(
        () => prisma.subject.findFirst({ where: { name: 'English', branchId: branch.id } }),
        () => prisma.subject.create({ data: { name: 'English', code: 'ENG101', branchId: branch.id } })
    );

    // 7. Staff
    const teacherEmail = 'teacher@basaeer.com';
    const existingTeacher = await prisma.user.findUnique({ where: { email: teacherEmail } });
    if (!existingTeacher) {
        const teacherUser = await prisma.user.create({
            data: {
                email: teacherEmail,
                password: hashedDefaultPassword,
                firstName: 'Musa',
                lastName: 'Abdullah',
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
        console.log('Teacher created');
    }

    const accountantEmail = 'accountant@basaeer.com';
    const existingAccountant = await prisma.user.findUnique({ where: { email: accountantEmail } });
    if (!existingAccountant) {
        const accountantUser = await prisma.user.create({
            data: {
                email: accountantEmail,
                password: hashedDefaultPassword,
                firstName: 'Zainab',
                lastName: 'Ibrahim',
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
        console.log('Accountant created');
    }

    // 8. Parents & Students (only if none yet)
    const existingStudentCount = await prisma.student.count({ where: { branchId: branch.id } });
    if (existingStudentCount === 0) {
        for (let i = 1; i <= 3; i++) {
            const parentEmail = `parent${i}@basaeer.com`;
            const parentUser = await prisma.user.create({
                data: {
                    email: parentEmail,
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
                        email: `student${i}_${j}@basaeer.com`,
                        password: hashedDefaultPassword,
                        firstName: `Student${i}_${j}`,
                        lastName: 'Child',
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
    } else {
        console.log(`Skipping student seeding — ${existingStudentCount} students already exist.`);
    }

    // 9. Finance
    const existingFees = await prisma.feeCategory.count({ where: { branchId: branch.id } });
    if (existingFees === 0) {
        const tuitionCategory = await prisma.feeCategory.create({
            data: { name: 'Tuition Fee', branchId: branch.id },
        });
        await prisma.feeStructure.create({
            data: { amount: 50000, categoryId: tuitionCategory.id, classId: grade1.id, branchId: branch.id },
        });
        console.log('Finance setup created');
    }

    // 10. Inventory
    const existingInventory = await prisma.inventoryProduct.count({ where: { branchId: branch.id } });
    if (existingInventory === 0) {
        const invCat = await prisma.inventoryCategory.create({
            data: { name: 'Stationery', branchId: branch.id },
        });
        const invUnit = await prisma.inventoryUnit.create({
            data: { name: 'Box', branchId: branch.id },
        });
        const invStore = await prisma.inventoryStore.create({
            data: { name: 'Main Store', branchId: branch.id },
        });
        await prisma.inventoryProduct.create({
            data: {
                name: 'Pencils',
                categoryId: invCat.id,
                unitId: invUnit.id,
                storeId: invStore.id,
                branchId: branch.id,
                stock: 100,
            },
        });
        console.log('Inventory setup created');
    }

    console.log('✅ Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
