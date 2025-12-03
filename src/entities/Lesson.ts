import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Module } from './Module';
import { Assignment } from './Assignment';
import { Attendance } from './Attendance';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'module_id' })
  moduleId!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'updated_at' })
  updatedAt?: Date;

  @Column({ type: 'int', nullable: true, name: 'updated_by' })
  updatedBy?: number;

  @ManyToOne(() => Module, (module) => module.lessons)
  @JoinColumn({ name: 'module_id' })
  module!: Module;

  @OneToMany(() => Assignment, (assignment) => assignment.lesson)
  assignments!: Assignment[];

  @OneToMany(() => Attendance, (attendance) => attendance.lesson)
  attendances!: Attendance[];
}

