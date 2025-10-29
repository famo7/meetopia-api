import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getNotifications, markAllAsRead, getNotificationCount, markNotificationAsRead, markNotificationAsUnRead, removeAllNotifications } from '../controllers/notificationController';
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

/**
 * PATCH /api/notifications/:notificationId/read
 * Mark a specific notification as read for the authenticated user
 */
router.patch('/:notificationId/read', markNotificationAsRead);

/**
 * PATCH /api/notifications/:notificationId/unread
 * Mark a specific notification as unread for the authenticated user
 */
router.patch('/:notificationId/unread', markNotificationAsUnRead);

/**
 * DELETE /api/notifications/remove-all
 * Remove all notifications for the authenticated user
 */
router.delete('/remove-all', removeAllNotifications);

export default router;