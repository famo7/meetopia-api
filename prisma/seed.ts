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

  const user3 = await prisma.user.create({
    data: {
      name: 'Test User 3',
      email: 'test3@gmail.com',
      passwordHash: hashedPassword
    }
  });

  console.log(`✅ Created users: ${user1.email}, ${user2.email}, ${user3.email}`);

  // Create meetings
  console.log('📅 Creating meetings...');

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const meeting1 = await prisma.meeting.create({
    data: {
      title: 'Daily Standup',
      description: 'Daily team standup meeting',
      date: today,
      status: 'SCHEDULED',
      creatorId: user1.id
    }
  });

  const meeting2 = await prisma.meeting.create({
    data: {
      title: 'Project Planning',
      description: 'Planning session for new features',
      date: tomorrow,
      status: 'SCHEDULED',
      creatorId: user2.id
    }
  });

  console.log(`✅ Created meetings: ${meeting1.title}, ${meeting2.title}`);

  // Add user3 as participant to both meetings
  console.log('👥 Adding participants...');

  await prisma.participant.create({
    data: {
      userId: user3.id,
      meetingId: meeting1.id,
      role: 'PARTICIPANT'
    }
  });

  await prisma.participant.create({
    data: {
      userId: user3.id,
      meetingId: meeting2.id,
      role: 'PARTICIPANT'
    }
  });

  console.log(`✅ Added User 3 as participant to both meetings`);

  // Create action items assigned to user3
  console.log('📋 Creating action items...');

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const actionItem1 = await prisma.actionItem.create({
    data: {
      title: 'Review code changes',
      description: 'Review pull requests for sprint 5',
      status: 'OPEN',
      dueDate: nextWeek,
      meetingId: meeting1.id,
      assignedById: user1.id,
      assignedToId: user3.id
    }
  });

  const actionItem2 = await prisma.actionItem.create({
    data: {
      title: 'Prepare presentation',
      description: 'Prepare slides for project demo',
      status: 'IN_PROGRESS',
      dueDate: nextWeek,
      meetingId: meeting2.id,
      assignedById: user2.id,
      assignedToId: user3.id
    }
  });

  console.log(`✅ Created action items: ${actionItem1.title}, ${actionItem2.title}`);

  // Summary
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`👥 Users: 3`);
  console.log(`📅 Meetings: 2 (today and tomorrow)`);
  console.log(`🤝 Participants: 2 (User 3 added to both meetings)`);
  console.log(`📋 Action Items: 2 (both assigned to User 3)`);

  console.log('\n🔑 Test Login Credentials:');
  console.log(`Email: test@gmail.com | Password: Password123 (Meeting Creator)`);
  console.log(`Email: test2@gmail.com | Password: Password123 (Meeting Creator)`);
  console.log(`Email: test3@gmail.com | Password: Password123 (Participant with 2 action items)`);

  console.log('\n📋 Test Scenario:');
  console.log(`User 1 (${user1.email}) - Created Meeting "${meeting1.title}" (today)`);
  console.log(`User 2 (${user2.email}) - Created Meeting "${meeting2.title}" (tomorrow)`);
  console.log(`User 3 (${user3.email}) - Participant in both meetings, 2 action items assigned`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });