import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Module } from './Module';
import { Enrollment } from './Enrollment';
import { CourseMaterial } from './CourseMaterial';

@Entity('courses')
@Index('idx_courses_teacher_id', ['teacherId'], { where: 'deleted_at IS NULL' })
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', name: 'teacher_id' })
  teacherId!: number;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'updated_at' })
  updatedAt?: Date;

  @Column({ type: 'int', nullable: true, name: 'updated_by' })
  updatedBy?: number;

  @ManyToOne(() => User, (user) => user.taughtCourses)
  @JoinColumn({ name: 'teacher_id' })
  teacher!: User;

  @OneToMany(() => Module, (module) => module.course)
  modules!: Module[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments!: Enrollment[];

  @OneToMany(() => CourseMaterial, (material) => material.course)
  materials!: CourseMaterial[];
}

