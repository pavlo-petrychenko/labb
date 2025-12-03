import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Course } from './Course';
import { Lesson } from './Lesson';

@Entity('modules')
@Index('idx_modules_course_order', ['courseId', 'orderIndex'], { where: 'deleted_at IS NULL' })
export class Module {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'course_id' })
  courseId!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ type: 'int', nullable: true, name: 'order_index' })
  orderIndex?: number;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'updated_at' })
  updatedAt?: Date;

  @Column({ type: 'int', nullable: true, name: 'updated_by' })
  updatedBy?: number;

  @ManyToOne(() => Course, (course) => course.modules)
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @OneToMany(() => Lesson, (lesson) => lesson.module)
  lessons!: Lesson[];
}

