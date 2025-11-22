import { PgTable } from 'drizzle-orm/pg-core';
import { DatabaseSchema } from './constant';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export type DBTableType<TTableName extends keyof DatabaseSchema> =
  DatabaseSchema[TTableName] extends { $inferSelect: infer S } ? S : never;

export type InsertType<TTableName extends keyof DatabaseSchema> =
  DatabaseSchema[TTableName] extends { $inferInsert: infer I } ? I : never;

// Filter to get only table names (not relations, enums, etc.)
export type TableNames = {
  [K in keyof DatabaseSchema]: DatabaseSchema[K] extends PgTable ? K : never;
}[keyof DatabaseSchema];

export type TableQueries = PostgresJsDatabase<DatabaseSchema>['query'];

export type TableQuery<TTableName extends TableNames> =
  TableQueries[TTableName];

export type TransactionType = PostgresJsDatabase<DatabaseSchema>['transaction'];
