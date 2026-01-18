import { PrismaClient } from './src/generated/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fetching online admissions...');
        const admissions = await prisma.onlineAdmission.findMany({
            include: {
                desiredClass: true,
                desiredSection: true,
                studentCategory: true,
                academicSession: true,
            }
        });
        console.log(`Successfully fetched ${admissions.length} admissions.`);
    } catch (error) {
        console.error('Error fetching admissions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
