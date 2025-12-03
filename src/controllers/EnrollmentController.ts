import { Request, Response } from 'express';
import { UnitOfWork } from '../unit-of-work/UnitOfWork';
import { getMongoDB } from '../config/mongodb';
import { StudentLearningPath } from '../config/mongodb';
import { AppDataSource } from '../config/database';

export class EnrollmentController {
  private unitOfWork: UnitOfWork;

  constructor() {
    this.unitOfWork = new UnitOfWork();
  }

  async enrollStudent(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, courseId } = req.body;

      const result = await this.unitOfWork.enrollStudentInCourseWithMaterials(
        studentId,
        courseId
      );

      // Create learning path in MongoDB
      const db = getMongoDB();
      const learningPath: StudentLearningPath = {
        studentId,
        courseId,
        learningPath: [],
        preferences: {},
      };
      await db.collection('student_learning_paths').insertOne(learningPath);

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getStudentEnrollments(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const enrollments = await this.unitOfWork.enrollments.getStudentEnrollments(
        parseInt(studentId)
      );
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getStudentProgress(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, courseId } = req.params;
      const result = await AppDataSource.query(
        'SELECT * FROM get_student_progress($1, $2)',
        [parseInt(studentId), parseInt(courseId)]
      );
      res.json(result[0] || null);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

