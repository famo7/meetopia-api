import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { NotificationService } from '../services/notificationService';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notificationService = NotificationService.getInstance();
    const notifications = await notificationService.getUserNotifications(req.user!.userId);
    
    res.json({ 
      success: true,
      notifications,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.isRead).length
    });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notificationService = NotificationService.getInstance();
    await notificationService.markNotificationsAsRead(req.user!.userId);
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notificationId = parseInt(req.params.notificationId);
    
    if (isNaN(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const notificationService = NotificationService.getInstance();
    const result = await notificationService.markNotificationAsRead(req.user!.userId, notificationId);
    
    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or already read'
      });
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (err) {
    next(err);
  }
};

export const getNotificationCount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notificationService = NotificationService.getInstance();
    const unreadCount = await notificationService.getUnreadCount(req.user!.userId);
    
    res.json({ 
      success: true,
      unreadCount
    });
  } catch (err) {
    next(err);
  }
};