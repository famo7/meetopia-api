import prisma from '../lib/prisma';
import { CreateMeetingRequest, UpdateMeetingRequest } from '../validations/Meeting';
import {
  MEETING_INCLUDE,
  DETAILED_MEETING_INCLUDE,
  getUserAccessCondition
} from '../lib/prismaConstants';

export class MeetingService {
  static async getUserMeetings(userId: number) {
    return await prisma.meeting.findMany({
      where: getUserAccessCondition(userId),
      include: MEETING_INCLUDE,
      orderBy: {
        date: 'desc'
      }
    });
  }

  static async getUserMeetingById(meetingId: number, userId: number) {
    return await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        ...getUserAccessCondition(userId)
      },
      include: DETAILED_MEETING_INCLUDE
    });
  }

  static async createMeeting(userId: number, data: CreateMeetingRequest) {
    return await prisma.meeting.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        creatorId: userId
      }
    });
  }

  static async updateMeeting(meetingId: number, userId: number, data: UpdateMeetingRequest) {
    try {
      const existingMeeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        select: { creatorId: true }
      });

      if (!existingMeeting) {
        throw { status: 404, message: "Meeting not found" };
      }

      if (existingMeeting.creatorId !== userId) {
        throw { status: 403, message: "Not authorized to update this meeting" };
      }
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.date !== undefined) updateData.date = new Date(data.date);
      if (data.status !== undefined) updateData.status = data.status;

      return await prisma.meeting.update({
        where: { id: meetingId },
        data: updateData,
        include: DETAILED_MEETING_INCLUDE
      });

    } catch (err: any) {
      if (err.status) {
        throw err;
      }
      throw { status: 500, message: "Internal server error" };
    }
  }

  static async deleteMeeting(meetingId: number, userId: number) {
    try {
      const existingMeeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        select: { creatorId: true }
      });

      if (!existingMeeting) {
        throw { status: 404, message: "Meeting not found" };
      }

      if (existingMeeting.creatorId !== userId) {
        throw { status: 403, message: "Not authorized to delete this meeting" };
      }

      await prisma.meeting.delete({
        where: { id: meetingId }
      });

    } catch (err: any) {
      if (err.status) {
        throw err;
      }
      throw { status: 500, message: "Internal server error" };
    }
  }
}