import prisma from '../lib/prisma';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
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

  static async generateAgoraToken(meetingId: number, userId: number) {
    try {
      // Verify user has access to the meeting
      const meeting = await this.getUserMeetingById(meetingId, userId);

      if (!meeting) {
        throw { status: 404, message: "Meeting not found or access denied" };
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true
        }
      });

      if (!user) {
        throw { status: 401, message: "User not found" };
      }

      const appId = process.env.AGORA_APP_ID;
      const appCertificate = process.env.AGORA_APP_CERTIFICATE;
      const channelName = `meetopia_${meetingId}`;

      if (!appId) {
        console.error('❌ AGORA_APP_ID is not set in environment variables');
        throw { status: 500, message: "Agora App ID not configured" };
      }


      const isModerator = meeting.creatorId === userId;

      let token = null;

      if (appCertificate) {


        const expirationTimeInSeconds = 86400;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;


        const role = RtcRole.PUBLISHER;

        token = RtcTokenBuilder.buildTokenWithUid(
          appId,
          appCertificate,
          channelName,
          userId,
          role,
          privilegeExpiredTs
        );

      } else {
        console.warn('⚠️ AGORA_APP_CERTIFICATE is not set. Generating a temporary token without certificate.');
      }

      return {
        appId,
        channelName,
        token,
        uid: userId,
        isModerator,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      };

    } catch (err: any) {
      if (err.status) {
        throw err;
      }
      throw { status: 500, message: "Failed to generate Agora token" };
    }
  }
}