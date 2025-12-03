import { Request, Response } from 'express';
import { UnitOfWork } from '../unit-of-work/UnitOfWork';

export class SubmissionController {
  private unitOfWork: UnitOfWork;

  constructor() {
    this.unitOfWork = new UnitOfWork();
  }

  async submitAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { assignmentId, studentId, content, graderId, grade } = req.body;

      if (graderId && grade) {
        // Submit and grade in one transaction
        const result = await this.unitOfWork.submitAndGradeAssignment(
          assignmentId,
          studentId,
          content,
          graderId,
          grade
        );
        res.status(201).json(result);
      } else {
        // Just submit
        const submissionId = await this.unitOfWork.submissions.submitAssignment(
          assignmentId,
          studentId,
          content
        );
        res.status(201).json({ submissionId });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAssignmentSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const { assignmentId } = req.params;
      const submissions = await this.unitOfWork.submissions.getAssignmentSubmissions(
        parseInt(assignmentId)
      );
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async gradeSubmission(req: Request, res: Response): Promise<void> {
    try {
      const { submissionId, graderId, grade } = req.body;
      const gradeId = await this.unitOfWork.grades.gradeSubmission(
        submissionId,
        graderId,
        grade
      );
      res.status(201).json({ gradeId });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

