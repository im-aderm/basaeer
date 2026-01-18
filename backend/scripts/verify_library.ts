import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient({
    log: ['error', 'warn'],
});

async function main() {
    console.log('--- Verifying Library Management ---');

    // 1. Get a branch
    const branch = await prisma.branch.findFirst();
    if (!branch) {
        console.error('No branch found. Please seed the database first.');
        return;
    }
    console.log(`Using Branch: ${branch.name}`);

    // 2. Create a book
    const book = await prisma.book.upsert({
        where: { isbn: '123-456-789' },
        update: {},
        create: {
            title: 'Prisma in Action',
            author: 'John Doe',
            isbn: '123-456-789',
            category: 'Technology',
            quantity: 5,
            available: 5,
            branchId: branch.id,
        },
    });
    console.log(`Book Created: ${book.title}`);

    // 3. Get all books
    const books = await prisma.book.findMany({
        where: { branchId: branch.id },
    });
    console.log(`Total Books in Branch: ${books.length}`);

    console.log('--- Verification Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
