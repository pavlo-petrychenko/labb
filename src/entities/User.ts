import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Role } from './Role';
import { UserRole } from './UserRole';
import { Course } from './Course';
import { Enrollment } from './Enrollment';
import { Submission } from './Submission';
import { Grade } from './Grade';
import { Attendance } from './Attendance';
import { Comment } from './Comment';
import { Notification } from './Notification';
import { AuditLog } from './AuditLog';

@Entity('users')
@Index('idx_users_email', ['email'], { where: 'deleted_at IS NULL' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'full_name' })
  fullName?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'updated_at' })
  updatedAt?: Date;

  @Column({ type: 'int', nullable: true, name: 'updated_by' })
  updatedBy?: number;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles!: UserRole[];

  @OneToMany(() => Course, (course) => course.teacher)
  taughtCourses!: Course[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments!: Enrollment[];

  @OneToMany(() => Submission, (submission) => submission.student)
  submissions!: Submission[];

  @OneToMany(() => Grade, (grade) => grade.grader)
  gradesGiven!: Grade[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances!: Attendance[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.changedByUser)
  auditLogs!: AuditLog[];
}

