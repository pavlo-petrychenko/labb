import { FindOptionsWhere, FindManyOptions, DeepPartial } from 'typeorm';

export interface IRepository<T> {
  findById(id: number): Promise<T | null>;
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  create(entity: DeepPartial<T>): Promise<T>;
  update(id: number, entity: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
  softDelete(id: number, deletedBy: number): Promise<boolean>;
  findBy(where: FindOptionsWhere<T>): Promise<T[]>;
  findOneBy(where: FindOptionsWhere<T>): Promise<T | null>;
}

