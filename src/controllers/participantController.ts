import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { ParticipantService } from '../services/participantService';
import { AddParticipantRequest } from '../validations/Participant';
import { NotificationService } from '../services/notificationService';
import { MeetingService } from '../services/meetingService';

export const getParticipants = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const meetingId = parseInt(req.params.meetingId);

    if (isNaN(meetingId)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    const participants = await ParticipantService.getParticipants(meetingId, req.user!.userId);
    res.json({ participants });
  } catch (err) {
    next(err);
  }
};

export const addParticipant = async (req: Request<{ meetingId: string }, {}, AddParticipantRequest> & AuthRequest, res: Response, next: NextFunction) => {
  try {
    const meetingId = parseInt(req.params.meetingId);

    if (isNaN(meetingId)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    const participant = await ParticipantService.addParticipant(meetingId, req.user!.userId, req.body);
    
    const notificationService = NotificationService.getInstance();
    const meeting = await MeetingService.getUserMeetingById(meetingId, req.user!.userId);
    
    if (meeting && req.body.userId !== req.user!.userId) {
      await notificationService.sendNotificationToUser(req.body.userId, {
        type: 'PARTICIPANT_ADDED',
        title: 'Added to Meeting',
        message: `You have been added to meeting: ${meeting.title}`,
        data: { meetingId, meetingTitle: meeting.title, type: 'meeting' }
      });
    }
    
    res.status(201).json({ message: 'Participant added successfully', participant });
  } catch (err) {
    next(err);
  }
};

export const removeParticipant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const meetingId = parseInt(req.params.meetingId);
    const participantId = parseInt(req.params.participantId);

    if (isNaN(meetingId) || isNaN(participantId)) {
      return res.status(400).json({ message: 'Invalid meeting ID or participant ID' });
    }

    await ParticipantService.removeParticipant(meetingId, participantId, req.user!.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const leaveAsMeeting = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const meetingId = parseInt(req.params.meetingId);

    if (isNaN(meetingId)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    await ParticipantService.leaveAsParticipant(meetingId, req.user!.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const searchParticipants = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const meetingId = parseInt(req.params.meetingId);
    const query = req.query.query as string;
    const limitParam = req.query.limit as string;

    if (isNaN(meetingId)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    if (query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    if (query.length > 100) {
      return res.status(400).json({ message: 'Search query too long (max 100 characters)' });
    }

    const limit = Math.min(parseInt(limitParam) || 10, 50);

    const users = await ParticipantService.searchParticipants(
      meetingId,
      req.user!.userId,
      query.trim(),
      limit
    );

    res.json({ users });
  } catch (err) {
    next(err);
  }
};
