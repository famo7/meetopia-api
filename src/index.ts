import express from 'express';
import authRoutes from './routes/authRoutes';

const app = express();
const port = 3000;

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});