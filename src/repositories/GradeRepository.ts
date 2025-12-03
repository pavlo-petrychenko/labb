import { BaseRepository } from './BaseRepository';
import { Grade } from '../entities/Grade';
import { AppDataSource } from '../config/database';

export class GradeRepository extends BaseRepository<Grade> {
  constructor() {
    super(Grade);
  }

  async gradeSubmission(
    submissionId: number,
    graderId: number,
    grade: number
  ): Promise<number> {
    const result = await AppDataSource.query(
      'SELECT grade_submission($1, $2, $3) as grade_id',
      [submissionId, graderId, grade]
    );
    return result[0]?.grade_id || null;
  }
}

