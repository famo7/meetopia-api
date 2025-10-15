import { Router } from 'express';
import { isAuthenticated } from '../middleware/authMiddleware';
import { validateData } from '../middleware/validationMiddleware';
import { AddParticipantSchema } from '../validations/Participant';
import { SearchParticipantsSchema } from '../validations/Search';
import {
  getParticipants,
  addParticipant,
  removeParticipant,
  leaveAsMeeting,
  searchParticipants
} from '../controllers/participantController';

const router = Router({ mergeParams: true }); // mergeParams to access meetingId from parent route

// All routes are prefixed with /meetings/:meetingId/participants
router.get('/', isAuthenticated, getParticipants);
router.get('/search', isAuthenticated, searchParticipants);
router.post('/', isAuthenticated, validateData(AddParticipantSchema), addParticipant);
router.delete('/me', isAuthenticated, leaveAsMeeting);
router.delete('/:participantId', isAuthenticated, removeParticipant);

export default router;
