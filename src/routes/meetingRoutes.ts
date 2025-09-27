import { Router } from 'express';
import {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting
} from '../controllers/meetingController';
import { validateData } from '../middleware/validationMiddleware';
import { CreateMeetingSchema, UpdateMeetingSchema } from '../validations/Meeting';
import { isAuthenticated } from '../middleware/authMiddleware';
import { requireAuth } from '../middleware/requireAuth';
const router = Router();

router.use(isAuthenticated, requireAuth);

router.get('/', getMeetings);

router.get('/:id', getMeetingById);

router.post('/', validateData(CreateMeetingSchema), createMeeting);

router.put('/:id', validateData(UpdateMeetingSchema), updateMeeting);

router.delete('/:id', deleteMeeting);

export default router;