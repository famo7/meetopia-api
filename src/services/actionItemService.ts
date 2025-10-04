import prisma from "../lib/prisma";
import { MeetingService } from "./meetingService";
import { USER_SELECT, ACTION_ITEM_INCLUDE } from "../lib/prismaConstants";
import { CreateActionItemRequest, UpdateActionItemRequest } from "../validations/ActionItem";

export class ActionItemService {
  static async getActionItems(meetingId: number, userId: number) {

    const meeting = await MeetingService.getUserMeetingById(meetingId, userId);

    if (!meeting) {
      throw { status: 404, message: "Meeting not found" };
    }

    const actionItems = await prisma.actionItem.findMany({
      where: { meetingId: meetingId },
      include: ACTION_ITEM_INCLUDE,
      orderBy: { createdAt: 'desc' }
    });

    return actionItems;
  }

  static async createActionItem(meetingId: number, userId: number, data: CreateActionItemRequest) {
    const meeting = await MeetingService.getUserMeetingById(meetingId, userId);

    if (!meeting) {
      throw { status: 404, message: "Meeting not found" };
    }

    const actionItem = await prisma.actionItem.create({
      data: {
        title: data.title,
        description: data.description || '',
        meetingId: meetingId,
        assignedById: userId,
        assignedToId: data.assignedToId ?? userId,
        status: 'OPEN',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      },
      include: {
        assignedBy: { select: USER_SELECT },
        assignedTo: { select: USER_SELECT }
      }
    });

    return actionItem;
  }

  static async updateActionItem(meetingId: number, actionItemId: number, userId: number, data: UpdateActionItemRequest) {
    // First, check if user has access to this meeting
    const meeting = await MeetingService.getUserMeetingById(meetingId, userId);

    if (!meeting) {
      throw { status: 404, message: "Meeting not found" };
    }

    // Get the existing action item
    const existingActionItem = await prisma.actionItem.findFirst({
      where: {
        id: actionItemId,
        meetingId: meetingId
      },
      include: {
        meeting: { select: { creatorId: true } }
      }
    });

    if (!existingActionItem) {
      throw { status: 404, message: "Action item not found" };
    }

    const isAssignedUser = existingActionItem.assignedToId === userId;
    const isMeetingCreator = existingActionItem.meeting.creatorId === userId;

    if (!isAssignedUser && !isMeetingCreator) {
      throw { status: 403, message: "Not authorized to update this action item" };
    }

    const updateData: any = {};

    if (isAssignedUser && !isMeetingCreator) {
      if (data.status !== undefined) {
        updateData.status = data.status;
      }

      if (data.title !== undefined || data.description !== undefined || data.assignedToId !== undefined || data.dueDate !== undefined) {
        throw { status: 403, message: "Assigned user can only update status" };
      }
    }

    if (isMeetingCreator) {
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

      if (data.assignedToId !== undefined) {
        const assignedToUser = await prisma.user.findUnique({
          where: { id: data.assignedToId },
          select: { id: true }
        });

        if (!assignedToUser) {
          throw { status: 400, message: "Assigned user not found" };
        }

        updateData.assignedToId = data.assignedToId;
      }
    }

    const updatedActionItem = await prisma.actionItem.update({
      where: { id: actionItemId },
      data: updateData,
      include: ACTION_ITEM_INCLUDE
    });

    return updatedActionItem;
  }

  static async deleteActionItem(meetingId: number, actionItemId: number, userId: number) {
    console.log('Delete action item called');
    console.log(`Meeting ID: ${meetingId}, Action Item ID: ${actionItemId}, User ID: ${userId}`);
  }
}
