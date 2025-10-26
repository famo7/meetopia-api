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
      console.log(`✅ Socket connected: ${socket.id}`);

      // Event listeners
      socket.on('join-meeting', (data) => this.handleJoinMeeting(socket, data));
      socket.on('leave-meeting', (data) => this.handleLeaveMeeting(socket, data));
      socket.on('update-notes', (data) => this.handleUpdateNotes(socket, data));
      socket.on('save-notes', (data) => this.handleSaveNotes(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  private async handleJoinMeeting(socket: Socket, data: { meetingId: string; userId: number; userName: string }) {
    console.log('📥 join-meeting event:', data);

    const { meetingId, userId, userName } = data;

    try {
      // Verify user has access to this meeting (creator or participant)
      const hasAccess = await this.verifyMeetingAccess(parseInt(meetingId), userId);

      if (!hasAccess) {
        console.log(`❌ User ${userId} denied access to meeting ${meetingId}`);
        socket.emit('error', { message: 'You do not have access to this meeting' });
        return;
      }

      // Join the socket room
      socket.join(meetingId);
      // 📢 NEW: Join user to their personal notification room
      socket.join(`user-${userId}`);
      console.log(`✅ User ${userName} (${userId}) joined meeting room ${meetingId} and notification room user-${userId}`);

      // Initialize room if it doesn't exist
      if (!this.meetingRooms[meetingId]) {
        this.meetingRooms[meetingId] = new Map();
      }

      // Assign random color to user
      const color = this.getRandomColor();

      // Add user to room tracking
      const connectedUser: ConnectedUser = {
        socketId: socket.id,
        userId,
        userName,
        color
      };
      this.meetingRooms[meetingId].set(socket.id, connectedUser);

      // Store meetingId in socket data for cleanup on disconnect
      (socket as any).meetingId = meetingId;
      (socket as any).userId = userId;

      // Get current users in room (excluding the one who just joined)
      const currentUsers = Array.from(this.meetingRooms[meetingId].values());

      // Send current users list to the newly joined user
      socket.emit('current-users', currentUsers.filter(u => u.socketId !== socket.id));

      // Notify others in room about new user
      socket.to(meetingId).emit('user-joined', {
        socketId: socket.id,
        userId,
        userName,
        color
      });

      console.log(`📊 Meeting ${meetingId} now has ${this.meetingRooms[meetingId].size} connected users`);
    } catch (error) {
      console.error('Error in handleJoinMeeting:', error);
      socket.emit('error', { message: 'Failed to join meeting' });
    }
  } private handleLeaveMeeting(socket: Socket, data: { meetingId: string; userId: number }) {
    console.log('📥 leave-meeting event:', data);

    const { meetingId, userId } = data;

    try {
      // Get user info before removing
      const user = this.meetingRooms[meetingId]?.get(socket.id);

      if (user) {
        // Leave socket room
        socket.leave(meetingId);

        // Remove from tracking
        this.meetingRooms[meetingId]?.delete(socket.id);

        // Notify others
        socket.to(meetingId).emit('user-left', {
          socketId: socket.id,
          userName: user.userName
        });

        console.log(`✅ User ${user.userName} (${userId}) left meeting ${meetingId}`);
        console.log(`📊 Meeting ${meetingId} now has ${this.meetingRooms[meetingId]?.size || 0} connected users`);

        // Cleanup empty room
        if (this.meetingRooms[meetingId]?.size === 0) {
          delete this.meetingRooms[meetingId];
          console.log(`🧹 Removed empty meeting room ${meetingId}`);
        }
      }
    } catch (error) {
      console.error('Error in handleLeaveMeeting:', error);
    }
  }

  private handleUpdateNotes(socket: Socket, data: { meetingId: string; userId: number; content: string }) {
    console.log('📥 update-notes event:', {
      meetingId: data.meetingId,
      userId: data.userId,
      contentLength: data.content?.length
    });

    const { meetingId, userId, content } = data;

    try {
      // Get user info
      const user = this.meetingRooms[meetingId]?.get(socket.id);

      if (user) {
        // Broadcast to all users in room EXCEPT the sender
        socket.to(meetingId).emit('notes-updated', {
          userId,
          userName: user.userName,
          content
        });

        console.log(`📝 User ${user.userName} (${userId}) updated notes in meeting ${meetingId} (${content.length} chars)`);
      }
    } catch (error) {
      console.error('Error in handleUpdateNotes:', error);
    }
  }

  private async handleSaveNotes(socket: Socket, data: { meetingId: string; content: string }) {
    console.log('📥 save-notes event:', {
      meetingId: data.meetingId,
      contentLength: data.content?.length
    });

    const { meetingId, content } = data;

    try {
      // Save notes using notesService
      const result = await this.saveNotesToDatabase(parseInt(meetingId), content);

      // Send confirmation to the user who saved
      socket.emit('notes-saved', {
        success: true,
        message: 'Notes saved successfully'
      });

      console.log(`💾 Notes saved for meeting ${meetingId} (${content.length} chars)`);
    } catch (error) {
      console.error('Error in handleSaveNotes:', error);
      socket.emit('notes-saved', {
        success: false,
        message: 'Failed to save notes'
      });
    }
  }

  private handleDisconnect(socket: Socket) {
    console.log(`❌ Socket disconnected: ${socket.id}`);

    try {
      // Get stored meeting data
      const meetingId = (socket as any).meetingId;
      const userId = (socket as any).userId;

      if (meetingId && this.meetingRooms[meetingId]) {
        // Get user info before removing
        const user = this.meetingRooms[meetingId].get(socket.id);

        if (user) {
          // Remove from tracking
          this.meetingRooms[meetingId].delete(socket.id);

          // Notify others
          socket.to(meetingId).emit('user-left', {
            socketId: socket.id,
            userName: user.userName
          });

          console.log(`🧹 Cleaned up user ${user.userName} (${userId}) from meeting ${meetingId}`);
          console.log(`📊 Meeting ${meetingId} now has ${this.meetingRooms[meetingId].size} connected users`);

          // Cleanup empty room
          if (this.meetingRooms[meetingId].size === 0) {
            delete this.meetingRooms[meetingId];
            console.log(`🧹 Removed empty meeting room ${meetingId}`);
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

  // Verify user has access to meeting (creator or participant)
  private async verifyMeetingAccess(meetingId: number, userId: number): Promise<boolean> {
    try {
      const { default: prisma } = await import('../lib/prisma');

      const meeting = await prisma.meeting.findFirst({
        where: {
          id: meetingId,
          ...getUserAccessCondition(userId)  // ✅ Reuse existing helper
        }
      });

      return meeting !== null;
    } catch (error) {
      console.error('Error verifying meeting access:', error);
      return false;
    }
  }

  // Save notes to database
  private async saveNotesToDatabase(meetingId: number, content: string): Promise<void> {
    try {
      const { default: prisma } = await import('../lib/prisma');

      // Upsert meeting note (update if exists, create if doesn't)
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

      console.log(`✅ Notes saved to database for meeting ${meetingId}`);
    } catch (error) {
      console.error('Error saving notes to database:', error);
      throw error;
    }
  }

  // Helper method to get IO instance if needed
  public getIO(): SocketIOServer {
    return this.io;
  }

  // 📢 UTILITY METHODS

  // Send message to specific user's room
  public sendToUser(userId: number, event: string, data: any) {
    this.io.to(`user-${userId}`).emit(event, data);
    console.log(`📤 Sent ${event} to user ${userId}`);
  }
}
