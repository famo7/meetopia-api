import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { CreateMeetingRequest, UpdateMeetingRequest } from '../validations/Meeting';
import { MeetingService } from '../services/meetingService';

export const getMeetings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const meetings = await MeetingService.getUserMeetings(req.user!.userId);
    res.json({ meetings });
  } catch (err) {
    next(err);
  }
};

export const getMeetingById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const meetingId = parseInt(req.params.id);
    if (isNaN(meetingId)) {
      throw { status: 400, message: "Invalid meeting ID" };
    }
    const meeting = await MeetingService.getUserMeetingById(meetingId, req.user!.userId);

    if (!meeting) {
      throw { status: 404, message: "Meeting not found" };
    }

    res.json({ meeting });
  } catch (err) {
    next(err);
  }
};

export const createMeeting = async (req: Request<{}, {}, CreateMeetingRequest> & AuthRequest, res: Response, next: NextFunction) => {
  try {
    const meeting = await MeetingService.createMeeting(req.user!.userId, req.body);
    res.status(201).json({ message: 'Meeting created successfully', meeting });
  } catch (err) {
    next(err);
  }
};

export const updateMeeting = async (
  req: Request<{ id: string }, {}, UpdateMeetingRequest> & AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const meetingId = parseInt(req.params.id);
    if (isNaN(meetingId)) {
      throw { status: 400, message: "Invalid meeting ID" };
    }

    const meeting = await MeetingService.updateMeeting(meetingId, req.user!.userId, req.body);

    res.json({
      message: "Meeting updated successfully",
      meeting
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMeeting = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const meetingId = parseInt(req.params.id);
    if (isNaN(meetingId)) {
      throw { status: 400, message: "Invalid meeting ID" };
    }

    await MeetingService.deleteMeeting(meetingId, req.user!.userId);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};