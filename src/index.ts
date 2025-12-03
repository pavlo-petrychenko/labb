import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { connectMongoDB } from './config/mongodb';
import { userRoutes } from './routes/userRoutes';
import { courseRoutes } from './routes/courseRoutes';
import { enrollmentRoutes } from './routes/enrollmentRoutes';
import { submissionRoutes } from './routes/submissionRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/submissions', submissionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database connections
async function initializeApp() {
  try {
    // Connect to PostgreSQL
    await AppDataSource.initialize();
    console.log('PostgreSQL connected');

    // Connect to MongoDB
    await connectMongoDB();
    console.log('MongoDB connected');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error initializing app:', error);
    process.exit(1);
  }
}

initializeApp();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await AppDataSource.destroy();
  process.exit(0);
});

