// Shared Prisma select and include patterns
export const USER_SELECT = {
  id: true,
  name: true,
  email: true
} as const;

export const MEETING_INCLUDE = {
  creator: { select: USER_SELECT },
  participants: {
    include: {
      user: { select: USER_SELECT }
    }
  },
  _count: {
    select: {
      participants: true,
      actionItems: true
    }
  }
} as const;

export const DETAILED_MEETING_INCLUDE = {
  creator: { select: USER_SELECT },
  participants: {
    include: {
      user: { select: USER_SELECT }
    }
  },
  notes: true,
  actionItems: {
    include: {
      assignedBy: { select: USER_SELECT },
      assignedTo: { select: USER_SELECT }
    }
  }
} as const;

export const ACTION_ITEM_INCLUDE = {
  assignedBy: { select: USER_SELECT },
  assignedTo: { select: USER_SELECT }
} as const;

export const getUserAccessCondition = (userId: number) => ({
  OR: [
    { creatorId: userId },
    {
      participants: {
        some: { userId: userId }
      }
    }
  ]
});