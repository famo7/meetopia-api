import prisma from '../lib/prisma';
import { USER_SELECT, getUserAccessCondition } from '../lib/prismaConstants';

export class DashboardService {
  static async getDashboardStats(userId: number) {
    try {
      const now = new Date();
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      const endOfToday = new Date(now.setHours(23, 59, 59, 999));

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
      endOfWeek.setHours(23, 59, 59, 999);

      // Get user access condition (creator or participant)
      const userAccessCondition = getUserAccessCondition(userId);

      // 1. Today's meetings
      const todaysMeetings = await prisma.meeting.findMany({
        where: {
          ...userAccessCondition,
          date: {
            gte: startOfToday,
            lte: endOfToday
          }
        },
        include: {
          creator: { select: USER_SELECT },
          participants: {
            include: {
              user: { select: USER_SELECT }
            }
          },
          _count: {
            select: {
              actionItems: true,
              participants: true
            }
          }
        },
        orderBy: {
          date: 'asc'
        }
      });

      // 2. This week's meetings count
      const thisWeekMeetingsCount = await prisma.meeting.count({
        where: {
          ...userAccessCondition,
          date: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        }
      });

      // 3. Upcoming meetings (future meetings, limit to next 5)
      const upcomingMeetings = await prisma.meeting.findMany({
        where: {
          ...userAccessCondition,
          date: {
            gt: endOfToday
          },
          status: {
            in: ['SCHEDULED', 'ACTIVE']
          }
        },
        include: {
          creator: { select: USER_SELECT },
          participants: {
            include: {
              user: { select: USER_SELECT }
            }
          },
          _count: {
            select: {
              actionItems: true,
              participants: true
            }
          }
        },
        orderBy: {
          date: 'asc'
        },
        take: 5
      });

      // 4. Pending action items assigned to user
      const pendingActionItems = await prisma.actionItem.findMany({
        where: {
          assignedToId: userId,
          status: {
            in: ['OPEN', 'IN_PROGRESS']
          },
          meeting: userAccessCondition
        },
        include: {
          meeting: {
            select: {
              id: true,
              title: true,
              date: true,
              status: true
            }
          },
          assignedBy: { select: USER_SELECT },
          assignedTo: { select: USER_SELECT }
        },
        orderBy: {
          dueDate: 'asc'
        }
      });

      // 5. Action items due this week
      const actionItemsDueThisWeek = await prisma.actionItem.count({
        where: {
          assignedToId: userId,
          status: {
            in: ['OPEN', 'IN_PROGRESS']
          },
          dueDate: {
            gte: startOfWeek,
            lte: endOfWeek
          },
          meeting: userAccessCondition
        }
      });

      // 6. Total statistics
      const totalMeetings = await prisma.meeting.count({
        where: userAccessCondition
      });

      const totalActionItems = await prisma.actionItem.count({
        where: {
          assignedToId: userId,
          meeting: userAccessCondition
        }
      });

      const completedActionItems = await prisma.actionItem.count({
        where: {
          assignedToId: userId,
          status: 'DONE',
          meeting: userAccessCondition
        }
      });

      return {
        today: {
          meetings: todaysMeetings,
          meetingsCount: todaysMeetings.length
        },
        thisWeek: {
          meetingsCount: thisWeekMeetingsCount,
          actionItemsDueCount: actionItemsDueThisWeek
        },
        upcoming: {
          meetings: upcomingMeetings,
          meetingsCount: upcomingMeetings.length
        },
        actionItems: {
          pending: pendingActionItems,
          pendingCount: pendingActionItems.length,
          totalCount: totalActionItems,
          completedCount: completedActionItems
        },
        totals: {
          meetings: totalMeetings,
          actionItems: totalActionItems,
          completedActionItems: completedActionItems
        }
      };

    } catch (err: any) {
      console.error('Database error in getDashboardStats:', err);
      throw { status: 500, message: "Internal server error" };
    }
  }
}
