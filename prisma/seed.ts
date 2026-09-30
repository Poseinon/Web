import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TECHZONE database for Prisma/MySQL...');

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  // Seed Users
  await prisma.user.upsert({
    where: { email: 'admin@techzone.vn' },
    update: {},
    create: {
      email: 'admin@techzone.vn',
      fullName: 'Quản Trị Viên TechZone',
      password: adminPassword,
      role: 'ADMIN',
      phone: '0901234567'
    }
  });

  await prisma.user.upsert({
    where: { email: 'user@techzone.vn' },
    update: {},
    create: {
      email: 'user@techzone.vn',
      fullName: 'Nguyễn Văn Minh',
      password: userPassword,
      role: 'USER',
      phone: '0987654321'
    }
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
