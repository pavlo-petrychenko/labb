import { MongoClient, Db } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27019/educational_platform?authSource=admin';

  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db('educational_platform');
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('Disconnected from MongoDB');
  }
}

export function getMongoDB(): Db {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongoDB() first.');
  }
  return db;
}

// MongoDB collections for NoSQL data
export interface UserActivity {
  userId: number;
  activityType: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface CourseAnalytics {
  courseId: number;
  date: Date;
  views: number;
  interactions: number;
  completionRate: number;
  metadata: Record<string, any>;
}

export interface StudentLearningPath {
  studentId: number;
  courseId: number;
  learningPath: Array<{
    moduleId: number;
    lessonId: number;
    completed: boolean;
    timeSpent: number;
    lastAccessed: Date;
  }>;
  preferences: Record<string, any>;
}

