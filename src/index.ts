import express from 'express';
import 'dotenv/config';
import authRoutes from './routes/authRoutes';
import meetingRoutes from './routes/meetingRoutes';
import { globalLimiter } from './middleware/ratelimit';

const app = express();
const port = 3000;

app.use(globalLimiter);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});