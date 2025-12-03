import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';

@Entity('audit_logs')
@Index('idx_audit_logs_entity_changed', ['entityName', 'changedAt'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, name: 'entity_name' })
  entityName!: string;

  @Column({ type: 'int', name: 'entity_id' })
  entityId!: number;

  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @Column({ type: 'int', name: 'changed_by' })
  changedBy!: number;

  @Column({ type: 'timestamp', nullable: true, name: 'changed_at' })
  changedAt?: Date;

  @ManyToOne(() => User, (user) => user.auditLogs)
  @JoinColumn({ name: 'changed_by' })
  changedByUser!: User;
}

