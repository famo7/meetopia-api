import { Router } from 'express';
import { isAuthenticated } from '../middleware/authMiddleware';
import { validateData } from '../middleware/validationMiddleware';
import { CreateActionItemSchema, UpdateActionItemSchema } from '../validations/ActionItem';
import {
  getActionItems,
  createActionItem,
  updateActionItem,
  deleteActionItem
} from '../controllers/actionItemController';

const router = Router({ mergeParams: true });

router.use(isAuthenticated);
router.get('/', getActionItems);
router.post('/', validateData(CreateActionItemSchema), createActionItem);

router.put('/:actionItemId', validateData(UpdateActionItemSchema), updateActionItem);

router.delete('/:actionItemId', deleteActionItem);

export default router;
