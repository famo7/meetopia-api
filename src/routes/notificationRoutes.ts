import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getNotifications, markAllAsRead, getNotificationCount } from '../controllers/notificationController';
import { isAuthenticated } from '../middleware/authMiddleware';

const router = Router();

// All notification routes require authentication
router.use(isAuthenticated, requireAuth);

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 */
router.get('/', getNotifications);

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */
router.patch('/mark-all-read', markAllAsRead);

/**
 * GET /api/notifications/count
 * Get unread notification count for the authenticated user
 */
router.get('/count', getNotificationCount);

export default router;