import { Repository, FindOptionsWhere, FindManyOptions, DeepPartial, EntityTarget, ObjectLiteral } from 'typeorm';
import { AppDataSource } from '../config/database';
import { IRepository } from './IRepository';

export class BaseRepository<T extends ObjectLiteral> implements IRepository<T> {
  protected repository: Repository<T>;

  constructor(entity: EntityTarget<T>) {
    this.repository = AppDataSource.getRepository(entity);
  }

  async findById(id: number): Promise<T | null> {
    return this.repository.findOne({ where: { id } as any });
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async create(entity: DeepPartial<T>): Promise<T> {
    const newEntity = this.repository.create(entity);
    return this.repository.save(newEntity);
  }

  async update(id: number, entity: Partial<T>): Promise<T | null> {
    await this.repository.update(id, entity as any);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async softDelete(id: number, deletedBy: number): Promise<boolean> {
    const entity = await this.findById(id);
    if (!entity) return false;

    const result = await this.repository.update(id, {
      deletedAt: new Date(),
      updatedAt: new Date(),
      updatedBy: deletedBy,
    } as any);

    return (result.affected ?? 0) > 0;
  }

  async findBy(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.repository.find({ where });
  }

  async findOneBy(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne({ where });
  }
}

