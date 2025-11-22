import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION, DatabaseSchema } from './constant';
import { BaseRepository } from './base.repository';
import { TableNames } from './types';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class RepositoryFactory {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: PostgresJsDatabase<DatabaseSchema>,
  ) {}

  create<TTableName extends TableNames>(
    tableName: TTableName,
  ): BaseRepository<TTableName> {
    return new BaseRepository(this.database, tableName);
  }
}
