import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import {
  User,
  Role,
  UserRole,
  Course,
  Module,
  Lesson,
  Assignment,
  Submission,
  Grade,
  Enrollment,
  CourseMaterial,
  Attendance,
  Comment,
  Notification,
  AuditLog,
} from '../entities';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5434'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'educational_platform',
  synchronize: false, // We'll use migrations or manual schema creation
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Role,
    UserRole,
    Course,
    Module,
    Lesson,
    Assignment,
    Submission,
    Grade,
    Enrollment,
    CourseMaterial,
    Attendance,
    Comment,
    Notification,
    AuditLog,
  ],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});

