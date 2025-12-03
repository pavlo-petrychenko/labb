import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

router.get('/:id', (req, res) => userController.getUserById(req, res));
router.get('/:id/roles', (req, res) => userController.getUserWithRoles(req, res));
router.get('/', (req, res) => userController.getActiveUsers(req, res));
router.post('/', (req, res) => userController.createUser(req, res));
router.delete('/:id', (req, res) => userController.softDeleteUser(req, res));

export { router as userRoutes };

