import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Submission } from './Submission';

@Entity('grades')
@Index('idx_grades_submission_id', ['submissionId'])
export class Grade {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'graded_by' })
  gradedBy!: number;

  @Column({ type: 'int', name: 'submission_id' })
  submissionId!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  grade!: number;

  @Column({ type: 'timestamp', nullable: true, name: 'graded_at' })
  gradedAt?: Date;

  @ManyToOne(() => User, (user) => user.gradesGiven)
  @JoinColumn({ name: 'graded_by' })
  grader!: User;

  @ManyToOne(() => Submission, (submission) => submission.grades)
  @JoinColumn({ name: 'submission_id' })
  submission!: Submission;
}

