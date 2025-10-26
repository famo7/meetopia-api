import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { getUserAccessCondition } from '../lib/prismaConstants';

// Type definitions
interface ConnectedUser {
  socketId: string;
  userId: number;
  userName: string;
  color: string;
}

interface MeetingRoom {
  [meetingId: string]: Map<string, ConnectedUser>;
}

// Color palette for users
const USER_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

export class SocketService {
  private io: SocketIOServer;
  private meetingRooms: MeetingRoom = {};

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.initialize();
  }

  private initialize() {
    this.io.on('connection', (socket: Socket) => {

      socket.on('join-meeting', (data) => this.handleJoinMeeting(socket, data));
      socket.on('leave-meeting', (data) => this.handleLeaveMeeting(socket, data));
      socket.on('update-notes', (data) => this.handleUpdateNotes(socket, data));
      socket.on('save-notes', (data) => this.handleSaveNotes(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  private async handleJoinMeeting(socket: Socket, data: { meetingId: string; userId: number; userName: string }) {

    const { meetingId, userId, userName } = data;

    try {
      const hasAccess = await this.verifyMeetingAccess(parseInt(meetingId), userId);

      if (!hasAccess) {
        socket.emit('error', { message: 'You do not have access to this meeting' });
        return;
      }

      socket.join(meetingId);
      socket.join(`user-${userId}`);


      if (!this.meetingRooms[meetingId]) {
        this.meetingRooms[meetingId] = new Map();
      }

      const color = this.getRandomColor();

      const connectedUser: ConnectedUser = {
        socketId: socket.id,
        userId,
        userName,
        color
      };
      this.meetingRooms[meetingId].set(socket.id, connectedUser);

      (socket as any).meetingId = meetingId;
      (socket as any).userId = userId;

      const currentUsers = Array.from(this.meetingRooms[meetingId].values());

      socket.emit('current-users', currentUsers.filter(u => u.socketId !== socket.id));

      socket.to(meetingId).emit('user-joined', {
        socketId: socket.id,
        userId,
        userName,
        color
      });

    } catch (error) {
      socket.emit('error', { message: 'Failed to join meeting' });
    }
  } private handleLeaveMeeting(socket: Socket, data: { meetingId: string; userId: number }) {

    const { meetingId, userId } = data;

    try {
      const user = this.meetingRooms[meetingId]?.get(socket.id);

      if (user) {
        socket.leave(meetingId);

        this.meetingRooms[meetingId]?.delete(socket.id);

        socket.to(meetingId).emit('user-left', {
          socketId: socket.id,
          userName: user.userName
        });

        if (this.meetingRooms[meetingId]?.size === 0) {
          delete this.meetingRooms[meetingId];
        }
      }
    } catch (error) {
    }
  }

  private handleUpdateNotes(socket: Socket, data: { meetingId: string; userId: number; content: string }) {

    const { meetingId, userId, content } = data;
    try {
      const user = this.meetingRooms[meetingId]?.get(socket.id);
      if (user) {
        socket.to(meetingId).emit('notes-updated', {
          userId,
          userName: user.userName,
          content
        });
      }
    } catch (error) {
    }
  }

  private async handleSaveNotes(socket: Socket, data: { meetingId: string; content: string }) {
    console.log('📥 save-notes event:', {
      meetingId: data.meetingId,
      contentLength: data.content?.length
    });

    const { meetingId, content } = data;

    try {
      const result = await this.saveNotesToDatabase(parseInt(meetingId), content);

      socket.emit('notes-saved', {
        success: true,
        message: 'Notes saved successfully'
      });

    } catch (error) {
      socket.emit('notes-saved', {
        success: false,
        message: 'Failed to save notes'
      });
    }
  }

  private handleDisconnect(socket: Socket) {
    try {
      const meetingId = (socket as any).meetingId;
      const userId = (socket as any).userId;

      if (meetingId && this.meetingRooms[meetingId]) {
        const user = this.meetingRooms[meetingId].get(socket.id);

        if (user) {
          this.meetingRooms[meetingId].delete(socket.id);

          socket.to(meetingId).emit('user-left', {
            socketId: socket.id,
            userName: user.userName
          });

          if (this.meetingRooms[meetingId].size === 0) {
            delete this.meetingRooms[meetingId];
          }
        }
      }
    } catch (error) {
      console.error('Error in handleDisconnect:', error);
    }
  }

  private getRandomColor(): string {
    return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
  }

  private async verifyMeetingAccess(meetingId: number, userId: number): Promise<boolean> {
    try {
      const { default: prisma } = await import('../lib/prisma');

      const meeting = await prisma.meeting.findFirst({
        where: {
          id: meetingId,
          ...getUserAccessCondition(userId)
        }
      });

      return meeting !== null;
    } catch (error) {
      return false;
    }
  }

  private async saveNotesToDatabase(meetingId: number, content: string): Promise<void> {
    try {
      const { default: prisma } = await import('../lib/prisma');

      await prisma.meetingNote.upsert({
        where: { meetingId },
        create: {
          meetingId,
          content
        },
        update: {
          content,
          updatedAt: new Date()
        }
      });

    } catch (error) {
      throw error;
    }
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  public sendToUser(userId: number, event: string, data: any) {
    this.io.to(`user-${userId}`).emit(event, data);
  }
}
