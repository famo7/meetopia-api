import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { CreateMeetingRequest, UpdateMeetingRequest } from '../validations/Meeting';

export const getMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { creatorId: req.user!.userId },
          {
            participants: {
              some: { userId: req.user!.userId }
            }
          }
        ]
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            participants: true,
            actionItems: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json({ meetings });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMeetingById = async (req: AuthRequest, res: Response) => {
  console.log('GET /api/meetings/:id called');
  console.log('Meeting ID:', req.params.id);
  console.log('User:', req.user);
  res.json({ message: 'Get meeting by ID endpoint', id: req.params.id });
};

// Create new meeting
export const createMeeting = async (req: Request<{}, {}, CreateMeetingRequest> & AuthRequest, res: Response) => {
  const { title, description, date } = req.body;
  try {
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        date: new Date(date),
        creatorId: req.user!.userId
      }
    });
    res.status(201).json({ message: 'Meeting created successfully', meeting });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update meeting
export const updateMeeting = async (req: Request<{}, {}, UpdateMeetingRequest> & AuthRequest, res: Response) => {
  console.log('PUT /api/meetings/:id called');
  console.log('Meeting ID:', req.params.id);
  console.log('User:', req.user);
  console.log('Request body:', req.body);
  res.json({ message: 'Update meeting endpoint', id: req.params.id });
};

// Delete meeting
export const deleteMeeting = async (req: AuthRequest, res: Response) => {
  console.log('DELETE /api/meetings/:id called');
  res.json({ message: 'Delete meeting endpoint', id: req.params.id });
};