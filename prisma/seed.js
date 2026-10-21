/**
 * The Mirage - Database Seeder Script
 * Seeds PostgreSQL the_mirage_db with verified demo accounts and initial platform records.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding The Mirage database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@themirage.vip' },
    update: {},
    create: {
      name: 'Mirage Super Admin',
      username: 'admin',
      email: 'admin@themirage.vip',
      password: hashedPassword,
      role: 'ADMIN',
      ageVerified: true,
      isEmailVerified: true,
    },
  });
  console.log('✓ Admin created:', admin.email);

  // 2. Create Featured Creator
  const creatorUser = await prisma.user.upsert({
    where: { email: 'creator@themirage.vip' },
    update: {},
    create: {
      name: 'Luna Rae',
      username: 'luna-rae',
      email: 'creator@themirage.vip',
      password: hashedPassword,
      role: 'CREATOR',
      ageVerified: true,
      isEmailVerified: true,
      creatorProfile: {
        create: {
          displayName: 'Luna Rae',
          handle: 'luna-rae',
          bio: 'Fashion model, lifestyle creator and visual artist. Welcome to my exclusive feed.',
          monthlyPrice: 9.99,
          isVerified: true,
          category: 'Popular',
          followerCount: 128000,
          subscriberCount: 428,
          totalEarnings: 14200.00,
        },
      },
    },
  });
  console.log('✓ Creator created:', creatorUser.email);

  // 3. Create Subscriber User
  const subscriber = await prisma.user.upsert({
    where: { email: 'subscriber@themirage.vip' },
    update: {},
    create: {
      name: 'Alex Mercer',
      username: 'alexmercer',
      email: 'subscriber@themirage.vip',
      password: hashedPassword,
      role: 'SUBSCRIBER',
      ageVerified: true,
      isEmailVerified: true,
    },
  });
  console.log('✓ Subscriber created:', subscriber.email);

  // 4. Create Platform Settings
  await prisma.platformSetting.upsert({
    where: { key: 'CREATOR_COMMISSION_PERCENT' },
    update: { value: '85' },
    create: { key: 'CREATOR_COMMISSION_PERCENT', value: '85' },
  });

  await prisma.platformSetting.upsert({
    where: { key: 'PLATFORM_COMMISSION_PERCENT' },
    update: { value: '15' },
    create: { key: 'PLATFORM_COMMISSION_PERCENT', value: '15' },
  });
  console.log('✓ 85/15 Revenue Split settings recorded');

  console.log('Database seeding completed successfully! ✨');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

