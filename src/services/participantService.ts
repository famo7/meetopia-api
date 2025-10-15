import prisma from '../lib/prisma';
import { MeetingService } from './meetingService';
import { USER_SELECT } from '../lib/prismaConstants';
import { AddParticipantRequest } from '../validations/Participant';

export class ParticipantService {
  static async addParticipant(meetingId: number, userId: number, data: AddParticipantRequest) {
    try {
      const meeting = await MeetingService.getUserMeetingById(meetingId, userId);

      if (!meeting) {
        throw { status: 404, message: "Meeting not found" };
      }

      const userExists = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { id: true }
      });

      if (!userExists) {
        throw { status: 404, message: "User not found" };
      }

      const existingParticipant = await prisma.participant.findUnique({
        where: {
          userId_meetingId: {
            userId: data.userId,
            meetingId
          }
        }
      });

      if (existingParticipant) {
        throw { status: 409, message: "User is already a participant in this meeting" };
      }


      const participant = await prisma.participant.create({
        data: {
          meetingId,
          userId: data.userId,
          role: data.role
        },
        include: {
          user: { select: USER_SELECT }
        }
      });

      return participant;

    } catch (err: any) {
      if (err.status) {
        throw err;
      }
      console.error('Database error in addParticipant:', err);
      throw { status: 500, message: "Internal server error" };
    }
  }

  static async removeParticipant(meetingId: number, participantId: number, userId: number) {
    try {
      const meeting = await MeetingService.getUserMeetingById(meetingId, userId);

      if (!meeting) {
        throw { status: 404, message: "Meeting not found or access denied" };
      }

      const participant = await prisma.participant.findUnique({
        where: { id: participantId }
      });

      if (!participant) {
        throw { status: 404, message: "Participant not found" };
      }

      if (participant.meetingId !== meetingId) {
        throw { status: 400, message: "Participant does not belong to this meeting" };
      }

      await prisma.participant.delete({
        where: { id: participantId }
      });

    } catch (err: any) {
      if (err.status) {
        throw err;
      }
      console.error('Database error in removeParticipant:', err);
      throw { status: 500, message: "Internal server error" };
    }
  }

  static async leaveAsParticipant(meetingId: number, userId: number) {
    try {
      const meeting = await MeetingService.getUserMeetingById(meetingId, userId);

      if (!meeting) {
        throw { status: 404, message: "Meeting not found or access denied" };
      }


      const participant = await prisma.participant.findUnique({
        where: {
          userId_meetingId: {
            userId,
            meetingId
          }
        }
      });

      if (!participant) {
        throw { status: 404, message: "You are not a participant in this meeting" };
      }

      await prisma.participant.delete({
        where: { id: participant.id }
      });

    } catch (err: any) {
      if (err.status) {
        throw err;
      }
      console.error('Database error in leaveAsParticipant:', err);
      throw { status: 500, message: "Internal server error" };
    }
  }

  static async getParticipants(meetingId: number, userId: number) {
    try {
      const meeting = await MeetingService.getUserMeetingById(meetingId, userId);

      if (!meeting) {
        throw { status: 404, message: "Meeting not found or access denied" };
      }

      const participants = await prisma.participant.findMany({
        where: { meetingId },
        include: {
          user: { select: USER_SELECT }
        },
        orderBy: [
          { role: 'asc' },
          { user: { name: 'asc' } }
        ]
      });

      return participants;

    } catch (err: any) {
      if (err.status) {
        throw err;
      }
      console.error('Database error in getParticipants:', err);
      throw { status: 500, message: "Internal server error" };
    }
  }

  static async searchParticipants(meetingId: number, userId: number, query: string, limit: number = 10) {
    try {
      const meeting = await MeetingService.getUserMeetingById(meetingId, userId);

      if (!meeting) {
        throw { status: 404, message: "Meeting not found or access denied" };
      }

      // Get existing participant IDs and meeting creator to exclude them from search
      const existingParticipants = await prisma.participant.findMany({
        where: { meetingId },
        select: { userId: true }
      });

      // Meeting creator is already in meeting, so exclude them too
      const excludeUserIds = [
        ...existingParticipants.map(p => p.userId),
        meeting.creatorId
      ];

      // Smart search: prioritize startsWith over contains for better precision
      const users = await prisma.user.findMany({
        where: {
          AND: [
            { id: { notIn: excludeUserIds } },
            {
              OR: [
                // Priority 1: Name starts with query (most relevant)
                { name: { startsWith: query, mode: 'insensitive' } },
                // Priority 2: Email starts with query
                { email: { startsWith: query, mode: 'insensitive' } },
                // Priority 3: Name contains query (for longer names)
                { name: { contains: query, mode: 'insensitive' } },
                // Priority 4: Email contains query (fallback)
                { email: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        select: USER_SELECT,
        take: limit,
        orderBy: [
          // Prioritize startsWith matches by sorting name first
          { name: 'asc' },
          { email: 'asc' }
        ]
      });

      return users;

    } catch (err: any) {
      if (err.status) {
        throw err;
      }
      console.error('Database error in searchParticipants:', err);
      throw { status: 500, message: "Internal server error" };
    }
  }
}
