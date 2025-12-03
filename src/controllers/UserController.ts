import { Request, Response } from 'express';
import { UnitOfWork } from '../unit-of-work/UnitOfWork';
import { getMongoDB } from '../config/mongodb';
import { UserActivity } from '../config/mongodb';

export class UserController {
  private unitOfWork: UnitOfWork;

  constructor() {
    this.unitOfWork = new UnitOfWork();
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.unitOfWork.users.findById(parseInt(id));

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserWithRoles(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userWithRoles = await this.unitOfWork.users.getUserWithRoles(parseInt(id));

      if (!userWithRoles) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(userWithRoles);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getActiveUsers(req: Request, res: Response): Promise<void> {
    try {
      // Using view for active users
      const result = await this.unitOfWork.users.getActiveUsers();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.unitOfWork.users.create(req.body);
      
      // Log activity to MongoDB
      const db = getMongoDB();
      const activity: UserActivity = {
        userId: user.id,
        activityType: 'USER_CREATED',
        timestamp: new Date(),
        metadata: { email: user.email },
      };
      await db.collection('user_activities').insertOne(activity);

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async softDeleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { deletedBy } = req.body;

      await this.unitOfWork.users.softDeleteUser(parseInt(id), deletedBy);
      res.json({ message: 'User soft deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

