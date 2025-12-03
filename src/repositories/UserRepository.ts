import { BaseRepository } from './BaseRepository';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email, deletedAt: null } as any,
    });
  }

  async getUserWithRoles(userId: number): Promise<any> {
    const result = await AppDataSource.query(
      'SELECT * FROM get_user_with_roles($1)',
      [userId]
    );
    return result[0] || null;
  }

  async softDeleteUser(userId: number, deletedBy: number): Promise<boolean> {
    await AppDataSource.query('SELECT soft_delete_user($1, $2)', [userId, deletedBy]);
    return true;
  }

  async getActiveUsers(): Promise<any[]> {
    return AppDataSource.query('SELECT * FROM v_active_users_with_roles');
  }
}

