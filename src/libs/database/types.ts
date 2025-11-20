import { PgTable } from 'drizzle-orm/pg-core';
import { DatabaseSchema } from './constant';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

export type DBTableType<TTableName extends keyof DatabaseSchema> =
  DatabaseSchema[TTableName]['$inferSelect'];

export type InsertType<TTableName extends keyof DatabaseSchema> =
  DatabaseSchema[TTableName]['$inferInsert'];

// Filter to get only table names (not relations, enums, etc.)
export type TableNames = {
  [K in keyof DatabaseSchema]: DatabaseSchema[K] extends PgTable ? K : never;
}[keyof DatabaseSchema];

export type TableQueries = NeonHttpDatabase<DatabaseSchema>['query'];

export type TableQuery<TTableName extends TableNames> =
  TableQueries[TTableName];

export type TransactionType = NeonHttpDatabase<DatabaseSchema>['transaction'];
