import express from 'express';
import { createServer } from 'http';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import meetingRoutes from './routes/meetingRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { globalLimiter } from './middleware/ratelimit';
import { errorHandler } from './middleware/errorHandler';
import { SocketService } from './services/socketService';
import { NotificationService } from './services/notificationService';
import notificationRoutes from './routes/notificationRoutes';

const app = express();
const port = 3000;

const httpServer = createServer(app);

const socketService = new SocketService(httpServer);
const notificationService = NotificationService.initialize(socketService);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(cookieParser());

app.use(globalLimiter);
app.use(express.json());

app.set('notificationService', notificationService);

app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use(errorHandler);

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`📡 WebSocket server ready for connections`);
});