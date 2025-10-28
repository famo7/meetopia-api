import prisma from '../lib/prisma';
import { SocketService } from './socketService';

export interface NotificationData {
  type: string;
  title: string;
  message: string;
  data?: any;
}

export class NotificationService {
  private static instance: NotificationService;
  private socketService: SocketService;

  private constructor(socketService: SocketService) {
    this.socketService = socketService;
  }

  public static initialize(socketService: SocketService): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(socketService);
    }
    return NotificationService.instance;
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      throw new Error('NotificationService not initialized. Call NotificationService.initialize() first.');
    }
    return NotificationService.instance;
  }

  async sendNotificationToUser(userId: number, notification: NotificationData) {
    const dbNotification = await prisma.notification.create({
      data: {
        userId,
        type: notification.type as any,
        title: notification.title,
        message: notification.message,
        relatedId: notification.data?.meetingId,
        relatedType: notification.data?.type
      }
    });

    this.socketService.sendToUser(userId, 'notification', {
      ...notification,
      id: dbNotification.id,
      createdAt: dbNotification.createdAt,
      read: false
    });

    return dbNotification;
  }

  async getUserNotifications(userId: number, limit = 50, offset = 0) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return notifications;
  }

  async markNotificationsAsRead(userId: number) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true }
    });

    return result;
  }

  async getUnreadCount(userId: number) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    return count;
  }

  async markNotificationAsRead(userId: number, notificationId: number) {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    return notification;
  }
}