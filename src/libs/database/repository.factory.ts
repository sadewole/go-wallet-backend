import { Injectable, Inject } from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DATABASE_CONNECTION, DatabaseSchema } from './constant';
import { BaseRepository } from './base.repository';
import { TableNames } from './types';

@Injectable()
export class RepositoryFactory {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NeonHttpDatabase<DatabaseSchema>,
  ) {}

  create<TTableName extends TableNames>(
    tableName: TTableName,
  ): BaseRepository<TTableName> {
    return new BaseRepository(this.database, tableName);
  }
}
