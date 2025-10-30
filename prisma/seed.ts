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
      startTime: today,
      endTime: new Date(today.getTime() + 60 * 60 * 1000), // +1 hour
      status: 'SCHEDULED',
      creatorId: user1.id
    }
  });

  const meeting2 = await prisma.meeting.create({
    data: {
      title: 'Project Planning',
      description: 'Planning session for new features',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // +2 hours
      status: 'SCHEDULED',
      creatorId: user2.id
    }
  });

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const meeting3 = await prisma.meeting.create({
    data: {
      title: 'Sprint Retrospective',
      description: 'End of sprint retrospective meeting',
      startTime: yesterday,
      endTime: new Date(yesterday.getTime() + 90 * 60 * 1000), // +1.5 hours
      status: 'ENDED',
      creatorId: user1.id
    }
  });

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const meeting4 = await prisma.meeting.create({
    data: {
      title: 'Client Presentation',
      description: 'Cancelled due to client unavailability',
      startTime: lastWeek,
      endTime: new Date(lastWeek.getTime() + 60 * 60 * 1000), // +1 hour
      status: 'CANCELLED',
      creatorId: user2.id
    }
  });

  const meeting5 = await prisma.meeting.create({
    data: {
      title: 'Team Brainstorming',
      description: 'Active brainstorming session in progress',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000), // +3 hours
      status: 'ACTIVE',
      creatorId: user3.id
    }
  });

  const meeting6 = await prisma.meeting.create({
    data: {
      title: 'Collaborative Workshop',
      description: 'Active workshop with all team members',
      startTime: today,
      endTime: new Date(today.getTime() + 4 * 60 * 60 * 1000), // +4 hours
      status: 'ACTIVE',
      creatorId: user3.id
    }
  });

  console.log(`✅ Created meetings: ${meeting1.title}, ${meeting2.title}, ${meeting3.title}, ${meeting4.title}, ${meeting5.title}, ${meeting6.title}`);

  // Add user3 as participant to all meetings
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

  await prisma.participant.create({
    data: {
      userId: user3.id,
      meetingId: meeting3.id,
      role: 'PARTICIPANT'
    }
  });

  await prisma.participant.create({
    data: {
      userId: user3.id,
      meetingId: meeting4.id,
      role: 'PARTICIPANT'
    }
  });

  // Add user1 and user2 as participants to meeting6 (created by user3)
  await prisma.participant.create({
    data: {
      userId: user1.id,
      meetingId: meeting6.id,
      role: 'PARTICIPANT'
    }
  });

  await prisma.participant.create({
    data: {
      userId: user2.id,
      meetingId: meeting6.id,
      role: 'PARTICIPANT'
    }
  });

  console.log(`✅ Added User 3 as participant to 4 meetings, User 1 and User 2 as participants to meeting 6`);

  // Create action items - comprehensive test data
  console.log('📋 Creating action items...');

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() + 14);

  // User 1 creates action items
  const actionItem1 = await prisma.actionItem.create({
    data: {
      title: 'Review code changes',
      description: 'Review pull requests for sprint 5',
      status: 'OPEN',
      priority: 'HIGH',
      dueDate: nextWeek,
      meetingId: meeting1.id,
      createdById: user1.id,
      assignedById: user1.id,
      assignedToId: user3.id
    }
  });

  const actionItem2 = await prisma.actionItem.create({
    data: {
      title: 'Update documentation',
      description: 'Update API documentation for new endpoints',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: nextWeek,
      meetingId: meeting1.id,
      createdById: user1.id,
      assignedById: user1.id,
      assignedToId: user2.id
    }
  });

  const actionItem3 = await prisma.actionItem.create({
    data: {
      title: 'Fix critical bug',
      description: 'Fix production bug in payment system',
      status: 'DONE',
      priority: 'HIGH',
      dueDate: nextWeek,
      meetingId: meeting1.id,
      createdById: user1.id,
      assignedById: user1.id,
      assignedToId: user1.id // Self-assigned
    }
  });

  // User 2 creates action items
  const actionItem4 = await prisma.actionItem.create({
    data: {
      title: 'Prepare presentation',
      description: 'Prepare slides for project demo',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: twoWeeks,
      meetingId: meeting2.id,
      createdById: user2.id,
      assignedById: user2.id,
      assignedToId: user3.id
    }
  });

  const actionItem5 = await prisma.actionItem.create({
    data: {
      title: 'Design new feature',
      description: 'Create mockups for user dashboard redesign',
      status: 'OPEN',
      priority: 'LOW',
      dueDate: twoWeeks,
      meetingId: meeting2.id,
      createdById: user2.id,
      assignedById: user2.id,
      assignedToId: user1.id
    }
  });

  const actionItem6 = await prisma.actionItem.create({
    data: {
      title: 'Setup testing environment',
      description: 'Configure Jest and Playwright for testing',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: nextWeek,
      meetingId: meeting2.id,
      createdById: user2.id,
      assignedById: user2.id,
      assignedToId: user2.id // Self-assigned
    }
  });

  // User 3 creates action items
  // Action items for Collaborative Workshop (meeting6)
  // - user1 assigns to user2 and user3
  // - user2 assigns to user1 and user3
  // - user3 assigns to user1 and user2

  const actionItem7 = await prisma.actionItem.create({
    data: {
      title: 'assignedToUser2_fromUser1',
      description: 'assignedToUser2_fromUser1',
      status: 'OPEN',
      priority: 'HIGH',
      dueDate: nextWeek,
      meetingId: meeting6.id,
      createdById: user1.id,
      assignedById: user1.id,
      assignedToId: user2.id
    }
  });

  const actionItem8 = await prisma.actionItem.create({
    data: {
      title: 'assignedToUser3_fromUser1',
      description: 'assignedToUser3_fromUser1',
      status: 'DONE',
      priority: 'MEDIUM',
      dueDate: nextWeek,
      meetingId: meeting6.id,
      createdById: user1.id,
      assignedById: user1.id,
      assignedToId: user3.id
    }
  });

  const actionItem9 = await prisma.actionItem.create({
    data: {
      title: 'assignedToUser1_fromUser2',
      description: 'assignedToUser1_fromUser2',
      status: 'DONE',
      priority: 'MEDIUM',
      dueDate: nextWeek,
      meetingId: meeting6.id,
      createdById: user2.id,
      assignedById: user2.id,
      assignedToId: user1.id
    }
  });

  const actionItem10 = await prisma.actionItem.create({
    data: {
      title: 'assignedToUser3_fromUser2',
      description: 'assignedToUser3_fromUser2',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: nextWeek,
      meetingId: meeting6.id,
      createdById: user2.id,
      assignedById: user2.id,
      assignedToId: user3.id
    }
  });

  const actionItem11 = await prisma.actionItem.create({
    data: {
      title: 'assignedToUser1_fromUser3',
      description: 'assignedToUser1_fromUser3',
      status: 'DONE',
      priority: 'MEDIUM',
      dueDate: nextWeek,
      meetingId: meeting6.id,
      createdById: user3.id,
      assignedById: user3.id,
      assignedToId: user1.id
    }
  });

  const actionItem12 = await prisma.actionItem.create({
    data: {
      title: 'assignedToUser2_fromUser3',
      description: 'assignedToUser2_fromUser3',
      status: 'OPEN',
      priority: 'LOW',
      dueDate: twoWeeks,
      meetingId: meeting6.id,
      createdById: user3.id,
      assignedById: user3.id,
      assignedToId: user2.id
    }
  });

  console.log(`✅ Created ${12} action items with varied assignments`);

  // Summary
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`👥 Users: 3`);
  console.log(`📅 Meetings: 6 (2 scheduled, 2 active, 1 ended, 1 cancelled)`);
  console.log(`🤝 Participants: 6 (User 3 in 4 meetings, User 1 & 2 in meeting 6)`);
  console.log(`📋 Action Items: 12 (varied across all users)`);

  console.log('\n🔑 Test Login Credentials:');
  console.log(`Email: test@gmail.com | Password: Password123`);
  console.log(`Email: test2@gmail.com | Password: Password123`);
  console.log(`Email: test3@gmail.com | Password: Password123`);

  console.log('\n📋 Action Items Breakdown:');
  console.log(`User 1 - Created: 4 items | Assigned to them: 4 items`);
  console.log(`User 2 - Created: 4 items | Assigned to them: 4 items`);
  console.log(`User 3 - Created: 4 items | Assigned to them: 4 items`);
  console.log('\n📊 Status Distribution:');
  console.log(`OPEN: 4 items | IN_PROGRESS: 4 items | DONE: 4 items`);
  console.log(`Priority: HIGH: 4 | MEDIUM: 4 | LOW: 4`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });