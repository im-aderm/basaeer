import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

async function main() {
  const lastBorrow = await prisma.borrowRecord.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!lastBorrow) {
    console.log('No borrow record found.');
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 5); // 5 days overdue

  await prisma.borrowRecord.update({
    where: { id: lastBorrow.id },
    data: { dueDate: yesterday },
  });

  console.log(
    `Updated borrow record ${lastBorrow.id} to be overdue (5 days ago).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
