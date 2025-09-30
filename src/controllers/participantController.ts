import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { ParticipantService } from '../services/participantService';
import { AddParticipantRequest } from '../validations/Participant';

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
