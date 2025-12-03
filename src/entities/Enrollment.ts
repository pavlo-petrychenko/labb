import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Course } from './Course';

@Entity('enrollments')
@Index('idx_enrollments_student_course', ['studentId', 'courseId'], { where: 'status = \'active\'' })
export class Enrollment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'student_id' })
  studentId!: number;

  @Column({ type: 'int', name: 'course_id' })
  courseId!: number;

  @Column({ type: 'timestamp', nullable: true, name: 'enrolled_at' })
  enrolledAt?: Date;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string;

  @ManyToOne(() => User, (user) => user.enrollments)
  @JoinColumn({ name: 'student_id' })
  student!: User;

  @ManyToOne(() => Course, (course) => course.enrollments)
  @JoinColumn({ name: 'course_id' })
  course!: Course;
}

