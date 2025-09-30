const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.actionItem.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.meetingNote.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('Password123', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'Test User 1',
      email: 'test@gmail.com',
      passwordHash: hashedPassword
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Test User 2',
      email: 'test2@gmail.com',
      passwordHash: hashedPassword
    }
  });

  console.log(`✅ Created users: ${user1.email}, ${user2.email}`);

  // Create one meeting
  console.log('📅 Creating meeting...');

  const meeting1 = await prisma.meeting.create({
    data: {
      title: 'Test Meeting 1',
      description: 'Test meeting created by user 1',
      date: new Date('2025-02-01T10:00:00Z'),
      status: 'SCHEDULED',
      creatorId: user1.id
    }
  });

  console.log(`✅ Created meeting: ${meeting1.title}`);

  // Summary
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`👥 Users: 2`);
  console.log(`📅 Meetings: 1`);

  console.log('\n🔑 Test Login Credentials:');
  console.log(`Email: test@gmail.com | Password: Password123`);
  console.log(`Email: test2@gmail.com | Password: Password123`);

  console.log('\n📋 Test Data:');
  console.log(`User 1 (${user1.email}) - Created Meeting ID: ${meeting1.id}`);
  console.log(`User 2 (${user2.email}) - Can be added as participant manually`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });