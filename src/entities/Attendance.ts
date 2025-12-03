import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from './Lesson';
import { User } from './User';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'lesson_id' })
  lessonId!: number;

  @Column({ type: 'int', name: 'student_id' })
  studentId!: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  status?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'recorded_at' })
  recordedAt?: Date;

  @ManyToOne(() => Lesson, (lesson) => lesson.attendances)
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Lesson;

  @ManyToOne(() => User, (user) => user.attendances)
  @JoinColumn({ name: 'student_id' })
  student!: User;
}

