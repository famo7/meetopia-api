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
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        createdById: userId
      },
      include: {
        assignedBy: { select: USER_SELECT },
        assignedTo: { select: USER_SELECT }
      }
    });

    return actionItem;
  }

  static async updateActionItem(meetingId: number, actionItemId: number, userId: number, data: UpdateActionItemRequest) {

    const meeting = await MeetingService.getUserMeetingById(meetingId, userId);


    if (!meeting) {
      throw { status: 404, message: "Meeting not found" };
    }

    const existingActionItem = await prisma.actionItem.findFirst({
      where: {
        id: actionItemId,
        meetingId: meetingId
      }
    });

    if (!existingActionItem) {
      throw { status: 404, message: "Action item not found" };
    }

    if (data.assignedToId !== undefined) {
      const assignedToUser = await prisma.user.findUnique({
        where: { id: data.assignedToId },
        select: { id: true }
      });

      if (!assignedToUser) {
        throw { status: 400, message: "Assigned user not found" };
      }
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;

    const updatedActionItem = await prisma.actionItem.update({
      where: { id: actionItemId },
      data: updateData,
      include: ACTION_ITEM_INCLUDE
    });

    return updatedActionItem;
  }

  static async deleteActionItem(meetingId: number, actionItemId: number, userId: number) {

    const meeting = await MeetingService.getUserMeetingById(meetingId, userId);


    if (!meeting) {
      console.log(`❌ SECURITY VIOLATION: User ${userId} attempted to delete action item ${actionItemId} from meeting ${meetingId} without access`);
      throw { status: 404, message: "Meeting not found" };
    }

    const existingActionItem = await prisma.actionItem.findFirst({
      where: {
        id: actionItemId,
        meetingId: meetingId
      }
    });

    if (!existingActionItem) {
      throw { status: 404, message: "Action item not found" };
    }

    const deleted = await prisma.actionItem.delete({
      where: { id: actionItemId },
      include: ACTION_ITEM_INCLUDE
    });

    return deleted;
  }
}
