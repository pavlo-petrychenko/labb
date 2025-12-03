import { BaseRepository } from './BaseRepository';
import { Course } from '../entities/Course';
import { AppDataSource } from '../config/database';

export class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super(Course);
  }

  async getCourseDetails(courseId: number): Promise<any> {
    const result = await AppDataSource.query(
      'SELECT * FROM v_course_details WHERE id = $1',
      [courseId]
    );
    return result[0] || null;
  }

  async getCourseStatistics(courseId: number): Promise<any> {
    const result = await AppDataSource.query(
      'SELECT * FROM get_course_statistics($1)',
      [courseId]
    );
    return result[0] || null;
  }

  async getTeacherCourses(teacherId: number): Promise<any[]> {
    return AppDataSource.query('SELECT * FROM get_teacher_courses($1)', [teacherId]);
  }

  async softDeleteCourse(courseId: number, deletedBy: number): Promise<boolean> {
    await AppDataSource.query('SELECT soft_delete_course($1, $2)', [courseId, deletedBy]);
    return true;
  }
}

