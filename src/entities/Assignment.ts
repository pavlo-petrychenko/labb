import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Lesson } from './Lesson';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'lesson_id' })
  lessonId!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'due_date' })
  dueDate?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'updated_at' })
  updatedAt?: Date;

  @Column({ type: 'int', nullable: true, name: 'updated_by' })
  updatedBy?: number;

  @ManyToOne(() => Lesson, (lesson) => lesson.assignments)
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Lesson;

  @OneToMany('Submission', 'assignment')
  submissions!: any[];
}

