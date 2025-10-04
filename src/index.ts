import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import meetingRoutes from './routes/meetingRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { globalLimiter } from './middleware/ratelimit';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = 3000;


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(cookieParser());

app.use(globalLimiter);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});