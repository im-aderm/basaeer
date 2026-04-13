
import { PrismaClient } from '../src/generated/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    console.log('Testing connection...');
    try {
        const studentsCount = await prisma.student.count();
        console.log('Students count:', studentsCount);

        const employeesCount = await prisma.staff.count();
        console.log('Employees count:', employeesCount);

        console.log('Fetching students with includes...');
        const students = await prisma.student.findMany({
            take: 1,
            include: {
                user: true,
                class: true,
                section: true,
            }
        });
        console.log('Successfully fetched student.');

        console.log('Fetching staff with includes...');
        const staff = await prisma.staff.findMany({
            take: 1,
            include: {
                user: true,
                department: true,
                designationRef: true
            }
        });
        console.log('Successfully fetched staff.');

    } catch (error) {
        console.error('Error during database operation:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
