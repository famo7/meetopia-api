import { Router } from 'express';
import {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  generateAgoraToken
} from '../controllers/meetingController';
import { validateData } from '../middleware/validationMiddleware';
import { CreateMeetingSchema, UpdateMeetingSchema } from '../validations/Meeting';
import { isAuthenticated } from '../middleware/authMiddleware';
import { requireAuth } from '../middleware/requireAuth';
import actionItemRoutes from './actionItemRoutes';
import participantRoutes from './participantRoutes';

const router = Router();

router.use(isAuthenticated, requireAuth);

router.get('/', getMeetings);

router.get('/:id', getMeetingById);

router.post('/', validateData(CreateMeetingSchema), createMeeting);

router.put('/:id', validateData(UpdateMeetingSchema), updateMeeting);

router.delete('/:id', deleteMeeting);

// Agora video token generation
router.post('/:id/agora-token', generateAgoraToken);

// Nested routes
router.use('/:meetingId/participants', participantRoutes);
router.use('/:meetingId/action-items', actionItemRoutes);
export default router;