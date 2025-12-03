import { Router } from 'express';
import { SubmissionController } from '../controllers/SubmissionController';

const router = Router();
const submissionController = new SubmissionController();

router.post('/', (req, res) => submissionController.submitAssignment(req, res));
router.get('/assignment/:assignmentId', (req, res) => submissionController.getAssignmentSubmissions(req, res));
router.post('/grade', (req, res) => submissionController.gradeSubmission(req, res));

export { router as submissionRoutes };

