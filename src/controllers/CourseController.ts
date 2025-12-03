import { Request, Response } from 'express';
import { UnitOfWork } from '../unit-of-work/UnitOfWork';
import { getMongoDB } from '../config/mongodb';
import { CourseAnalytics } from '../config/mongodb';

export class CourseController {
  private unitOfWork: UnitOfWork;

  constructor() {
    this.unitOfWork = new UnitOfWork();
  }

  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const course = await this.unitOfWork.courses.findById(parseInt(id));

      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      res.json(course);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCourseDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const courseDetails = await this.unitOfWork.courses.getCourseDetails(parseInt(id));

      if (!courseDetails) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      res.json(courseDetails);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCourseStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const statistics = await this.unitOfWork.courses.getCourseStatistics(parseInt(id));

      if (!statistics) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      res.json(statistics);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTeacherCourses(req: Request, res: Response): Promise<void> {
    try {
      const { teacherId } = req.params;
      const courses = await this.unitOfWork.courses.getTeacherCourses(parseInt(teacherId));
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const course = await this.unitOfWork.courses.create(req.body);
      
      // Store analytics in MongoDB
      const db = getMongoDB();
      const analytics: CourseAnalytics = {
        courseId: course.id,
        date: new Date(),
        views: 0,
        interactions: 0,
        completionRate: 0,
        metadata: { title: course.title },
      };
      await db.collection('course_analytics').insertOne(analytics);

      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async softDeleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { deletedBy } = req.body;

      await this.unitOfWork.courses.softDeleteCourse(parseInt(id), deletedBy);
      res.json({ message: 'Course soft deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

