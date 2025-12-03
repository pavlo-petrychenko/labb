import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Assignment } from './Assignment';
import { User } from './User';
import { Grade } from './Grade';

@Entity('submissions')
@Index('idx_submissions_assignment_student', ['assignmentId', 'studentId'])
export class Submission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'assignment_id' })
  assignmentId!: number;

  @Column({ type: 'int', name: 'student_id' })
  studentId!: number;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'submitted_at' })
  submittedAt?: Date;

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions)
  @JoinColumn({ name: 'assignment_id' })
  assignment!: Assignment;

  @ManyToOne(() => User, (user) => user.submissions)
  @JoinColumn({ name: 'student_id' })
  student!: User;

  @OneToMany(() => Grade, (grade) => grade.submission)
  grades!: Grade[];
}

