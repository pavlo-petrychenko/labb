import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './Course';

@Entity('course_materials')
export class CourseMaterial {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'course_id' })
  courseId!: number;

  @Column({ type: 'text', nullable: true, name: 'file_url' })
  fileUrl?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'updated_at' })
  updatedAt?: Date;

  @Column({ type: 'int', nullable: true, name: 'updated_by' })
  updatedBy?: number;

  @ManyToOne(() => Course, (course) => course.materials)
  @JoinColumn({ name: 'course_id' })
  course!: Course;
}

