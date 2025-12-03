import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Role } from './Role';

@Entity('user_roles')
@Index('idx_user_roles_user_id_hash', ['userId'])
export class UserRole {
  @PrimaryColumn({ name: 'user_id' })
  userId!: number;

  @PrimaryColumn({ name: 'role_id' })
  roleId!: number;

  @Column({ type: 'timestamp', nullable: true, name: 'granted_at' })
  grantedAt?: Date;

  @ManyToOne(() => User, (user) => user.userRoles)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Role, (role) => role.userRoles)
  @JoinColumn({ name: 'role_id' })
  role!: Role;
}

