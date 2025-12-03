import { Router } from 'express';
import { CourseController } from '../controllers/CourseController';

const router = Router();
const courseController = new CourseController();

router.get('/:id', (req, res) => courseController.getCourseById(req, res));
router.get('/:id/details', (req, res) => courseController.getCourseDetails(req, res));
router.get('/:id/statistics', (req, res) => courseController.getCourseStatistics(req, res));
router.get('/teacher/:teacherId', (req, res) => courseController.getTeacherCourses(req, res));
router.post('/', (req, res) => courseController.createCourse(req, res));
router.delete('/:id', (req, res) => courseController.softDeleteCourse(req, res));

export { router as courseRoutes };

