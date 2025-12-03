import { Router } from 'express';
import { EnrollmentController } from '../controllers/EnrollmentController';

const router = Router();
const enrollmentController = new EnrollmentController();

router.post('/', (req, res) => enrollmentController.enrollStudent(req, res));
router.get('/student/:studentId', (req, res) => enrollmentController.getStudentEnrollments(req, res));
router.get('/student/:studentId/course/:courseId/progress', (req, res) => enrollmentController.getStudentProgress(req, res));

export { router as enrollmentRoutes };

