import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION, DatabaseSchema } from './constant';
import { BaseRepository } from './base.repository';

@Injectable()
export class RepositoryFactory {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<DatabaseSchema>,
  ) {}

  create<TTableName extends keyof DatabaseSchema>(
    tableName: TTableName,
  ): BaseRepository<TTableName> {
    return new BaseRepository(this.database, tableName);
  }
}
