import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { isAuthenticated } from '../middleware/authMiddleware';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.use(isAuthenticated, requireAuth);

// GET /api/dashboard - Get dashboard statistics
router.get('/', getDashboard);

export default router;
