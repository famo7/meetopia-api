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