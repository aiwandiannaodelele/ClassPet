import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@admin.com';
  const password = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      password,
    },
    create: {
      email,
      name: 'Super Admin',
      password,
      role: 'ADMIN',
    },
  });

  // Init settings
  await prisma.systemSetting.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      enableEmailVerify: false,
      enableTurnstile: false,
    },
  });

  console.log('Admin user created:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
