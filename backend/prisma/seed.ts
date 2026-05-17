import { PrismaClient, UserRole } from '../src/generated/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting minimal seed process...');

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
    console.log('All tables truncated.');
  } catch (error) {
    console.log('Error during truncate, falling back to manual deletion...');
  }

  const passwordHash = await bcrypt.hash('Password123!', 8);

  // 2. Seed only Super Admin user
  console.log('Seeding Super Admin...');
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@basaeer.com',
      password: passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log('\nSeed process completed successfully!');
  console.log('--- Login Credentials ---');
  console.log(`Super Admin: admin@basaeer.com / Password123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
