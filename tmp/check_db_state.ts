import { PrismaClient } from '../backend/src/generated/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const tables: any = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables in database:');
    console.log(tables.map((t: any) => t.table_name).sort());

    const migrations: any = await prisma.$queryRaw`SELECT migration_name, applied_steps_count FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 5`;
    console.log('\nLatest migrations:');
    console.log(JSON.stringify(migrations, null, 2));
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
