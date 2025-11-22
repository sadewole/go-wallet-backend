import { Inject, Logger } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { AnyPgTable } from 'drizzle-orm/pg-core';
import { count, eq, SQL } from 'drizzle-orm';
import { DATABASE_CONNECTION, DatabaseSchema, schemas } from './constant';
import {
  DBTableType,
  InsertType,
  TableNames,
  TableQuery,
  TransactionType,
} from './types';
export class BaseRepository<TTableName extends TableNames> {
  protected readonly logger: Logger;
  protected readonly table: DatabaseSchema[TTableName];

  constructor(
    @Inject(DATABASE_CONNECTION)
    protected readonly database: PostgresJsDatabase<DatabaseSchema>,
    protected readonly tableName: TTableName,
    logger?: Logger,
  ) {
    this.table = schemas[tableName];
    this.logger = logger || new Logger(`BaseRepository:${String(tableName)}`);
  }

  // Relational query methods
  findMany(options?: Parameters<TableQuery<TTableName>['findMany']>[0]) {
    return this.database.query[this.tableName].findMany(
      options,
    ) as unknown as Promise<DBTableType<TTableName>[]>;
  }

  findFirst(options?: Parameters<TableQuery<TTableName>['findFirst']>[0]) {
    return this.database.query[this.tableName].findFirst(
      options,
    ) as unknown as Promise<DBTableType<TTableName> | undefined>;
  }

  // Alias for findFirst for convenience
  findOne(options?: Parameters<TableQuery<TTableName>['findFirst']>[0]) {
    return this.findFirst(options);
  }

  async create(data: Omit<InsertType<TTableName>, 'id'>) {
    const result = await this.database
      .insert(this.table)
      .values(data as any)
      .returning();
    return result[0] as DBTableType<TTableName>;
  }

  async createMany(data: Omit<InsertType<TTableName>, 'id'>[]) {
    return await this.database
      .insert(this.table)
      .values(data as any)
      .returning();
  }

  async update(id: number | string, data: Partial<InsertType<TTableName>>) {
    const idColumn = (this.table as any).id;
    if (!idColumn) {
      throw new Error(`Table ${this.tableName} does not have an 'id' column`);
    }

    const result = await this.database
      .update(this.table)
      .set(data as any)
      .where(eq(idColumn, id))
      .returning();
    return result[0] as DBTableType<TTableName>;
  }

  async updateMany(
    conditions: SQL | undefined,
    data: Partial<InsertType<TTableName>>,
  ) {
    return await this.database
      .update(this.table)
      .set(data as any)
      .where(conditions)
      .returning();
  }

  async delete(id: number | string) {
    const idColumn = (this.table as any).id;
    if (!idColumn) {
      throw new Error(`Table ${this.tableName} does not have an 'id' column`);
    }

    const result = await this.database
      .delete(this.table)
      .where(eq(idColumn, id))
      .returning();
    return result[0] as DBTableType<TTableName>;
  }

  async deleteMany(conditions: SQL | undefined) {
    return await this.database.delete(this.table).where(conditions).returning();
  }

  // Count with relational query
  async count(options?: { where?: any }): Promise<number> {
    const result = await this.database
      .select({ count: count() })
      .from(this.table as AnyPgTable)
      .where(options?.where);
    return result[0]?.count || 0;
  }

  // Enhanced pagination with relational queries
  async findWithPagination(options?: {
    where?: any;
    page?: number;
    limit?: number;
    orderBy?: any;
    with?: any;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.findMany({
        ...options,
        limit,
        offset,
      }),
      this.count({ where: options?.where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // Transaction support
  async transaction<T>(
    callback: (tx: TransactionType) => Promise<T>,
  ): Promise<T> {
    return await this.database.transaction(callback as any);
  }

  withTransaction(tx: TransactionType): BaseRepository<TTableName> {
    return new BaseRepository(
      tx as unknown as PostgresJsDatabase<DatabaseSchema>,
      this.tableName,
      this.logger,
    );
  }

  // Get the query builder for this table
  get query() {
    return this.database.select().from(this.table as AnyPgTable);
  }
}
