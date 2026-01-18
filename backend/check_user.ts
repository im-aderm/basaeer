
import { PrismaClient } from './src/generated/client/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    const email = 'superadmin@basaeer.com';
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log('User not found');
    } else {
        console.log('User found:', {
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        });
        const isMatch = await bcrypt.compare('admin123', user.password);
        console.log('Password match:', isMatch);
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
