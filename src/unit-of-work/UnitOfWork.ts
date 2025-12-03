import { DataSource, QueryRunner } from 'typeorm';
import { AppDataSource } from '../config/database';
import { UserRepository } from '../repositories/UserRepository';
import { CourseRepository } from '../repositories/CourseRepository';
import { EnrollmentRepository } from '../repositories/EnrollmentRepository';
import { SubmissionRepository } from '../repositories/SubmissionRepository';
import { GradeRepository } from '../repositories/GradeRepository';

export class UnitOfWork {
  private queryRunner: QueryRunner;
  private _users?: UserRepository;
  private _courses?: CourseRepository;
  private _enrollments?: EnrollmentRepository;
  private _submissions?: SubmissionRepository;
  private _grades?: GradeRepository;

  constructor() {
    this.queryRunner = AppDataSource.createQueryRunner();
  }

  get users(): UserRepository {
    if (!this._users) {
      this._users = new UserRepository();
    }
    return this._users;
  }

  get courses(): CourseRepository {
    if (!this._courses) {
      this._courses = new CourseRepository();
    }
    return this._courses;
  }

  get enrollments(): EnrollmentRepository {
    if (!this._enrollments) {
      this._enrollments = new EnrollmentRepository();
    }
    return this._enrollments;
  }

  get submissions(): SubmissionRepository {
    if (!this._submissions) {
      this._submissions = new SubmissionRepository();
    }
    return this._submissions;
  }

  get grades(): GradeRepository {
    if (!this._grades) {
      this._grades = new GradeRepository();
    }
    return this._grades;
  }

  async beginTransaction(): Promise<void> {
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
  }

  async commit(): Promise<void> {
    await this.queryRunner.commitTransaction();
  }

  async rollback(): Promise<void> {
    await this.queryRunner.rollbackTransaction();
  }

  async release(): Promise<void> {
    await this.queryRunner.release();
  }

  // Example: Complete enrollment flow using stored procedures
  async enrollStudentInCourseWithMaterials(
    studentId: number,
    courseId: number
  ): Promise<{ enrollmentId: number; progress: any }> {
    try {
      await this.beginTransaction();

      // Use stored procedure to enroll student
      const enrollmentId = await this.enrollments.enrollStudent(studentId, courseId);

      // Get student progress using stored procedure
      const progress = await AppDataSource.query(
        'SELECT * FROM get_student_progress($1, $2)',
        [studentId, courseId]
      );

      await this.commit();
      return { enrollmentId, progress: progress[0] || null };
    } catch (error) {
      await this.rollback();
      throw error;
    } finally {
      await this.release();
    }
  }

  // Example: Complete assignment submission and grading flow
  async submitAndGradeAssignment(
    assignmentId: number,
    studentId: number,
    content: string,
    graderId: number,
    grade: number
  ): Promise<{ submissionId: number; gradeId: number }> {
    try {
      await this.beginTransaction();

      // Use stored procedure to submit assignment
      const submissionId = await this.submissions.submitAssignment(
        assignmentId,
        studentId,
        content
      );

      // Use stored procedure to grade submission
      const gradeId = await this.grades.gradeSubmission(submissionId, graderId, grade);

      await this.commit();
      return { submissionId, gradeId };
    } catch (error) {
      await this.rollback();
      throw error;
    } finally {
      await this.release();
    }
  }
}

