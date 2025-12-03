import { BaseRepository } from './BaseRepository';
import { Enrollment } from '../entities/Enrollment';
import { AppDataSource } from '../config/database';

export class EnrollmentRepository extends BaseRepository<Enrollment> {
  constructor() {
    super(Enrollment);
  }

  async enrollStudent(studentId: number, courseId: number): Promise<number> {
    const result = await AppDataSource.query(
      'SELECT enroll_student_in_course($1, $2) as enrollment_id',
      [studentId, courseId]
    );
    return result[0]?.enrollment_id || null;
  }

  async getStudentEnrollments(studentId: number): Promise<any[]> {
    return AppDataSource.query(
      'SELECT * FROM v_student_enrollments WHERE student_id = $1',
      [studentId]
    );
  }
}

