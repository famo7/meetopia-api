import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { CreateActionItemRequest, UpdateActionItemRequest } from '../validations/ActionItem';
import { ActionItemService } from '../services/actionItemService';

export const getActionItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const meetingId = parseInt(req.params.meetingId);

    if (isNaN(meetingId)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    const actionItems = await ActionItemService.getActionItems(meetingId, req.user!.userId);
    res.json({ actionItems });
  } catch (err) {
    next(err);
  }
};

export const createActionItem = async (req: Request<{ meetingId: string }, {}, CreateActionItemRequest> & AuthRequest, res: Response, next: NextFunction) => {
  try {
    const meetingId = parseInt(req.params.meetingId);

    if (isNaN(meetingId)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    const actionItem = await ActionItemService.createActionItem(meetingId, req.user!.userId, req.body);
    res.status(201).json({ message: 'Action item created successfully', actionItem });
  } catch (err) {
    next(err);
  }
};

export const updateActionItem = async (req: Request<{ meetingId: string; actionItemId: string }, {}, UpdateActionItemRequest> & AuthRequest, res: Response, next: NextFunction) => {
  try {
    const meetingId = parseInt(req.params.meetingId);
    const actionItemId = parseInt(req.params.actionItemId);

    if (isNaN(meetingId) || isNaN(actionItemId)) {
      return res.status(400).json({ message: 'Invalid meeting ID or action item ID' });
    }

    const actionItem = await ActionItemService.updateActionItem(meetingId, actionItemId, req.user!.userId, req.body);
    res.json({ message: 'Action item updated successfully', actionItem });
  } catch (err) {
    next(err);
  }
};

export const deleteActionItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const meetingId = parseInt(req.params.meetingId);
    const actionItemId = parseInt(req.params.actionItemId);

    if (isNaN(meetingId) || isNaN(actionItemId)) {
      return res.status(400).json({ message: 'Invalid meeting ID or action item ID' });
    }

    await ActionItemService.deleteActionItem(meetingId, actionItemId, req.user!.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
