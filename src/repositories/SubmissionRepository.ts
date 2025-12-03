import { BaseRepository } from './BaseRepository';
import { Submission } from '../entities/Submission';
import { AppDataSource } from '../config/database';

export class SubmissionRepository extends BaseRepository<Submission> {
  constructor() {
    super(Submission);
  }

  async submitAssignment(
    assignmentId: number,
    studentId: number,
    content: string
  ): Promise<number> {
    const result = await AppDataSource.query(
      'SELECT submit_assignment($1, $2, $3) as submission_id',
      [assignmentId, studentId, content]
    );
    return result[0]?.submission_id || null;
  }

  async getAssignmentSubmissions(assignmentId: number): Promise<any[]> {
    return AppDataSource.query(
      'SELECT * FROM v_assignment_submissions WHERE assignment_id = $1',
      [assignmentId]
    );
  }
}

