import { Inject, Logger } from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { AnyPgTable } from 'drizzle-orm/pg-core';
import { count, eq, SQL } from 'drizzle-orm';
import { DATABASE_CONNECTION, DatabaseSchema, schemas } from './constant';

// Helper types for better TypeScript support
export type SelectType<TTableName extends keyof DatabaseSchema> =
  DatabaseSchema[TTableName]['$inferSelect'];
export type InsertType<TTableName extends keyof DatabaseSchema> =
  DatabaseSchema[TTableName]['$inferInsert'];

export class BaseRepository<TTableName extends keyof DatabaseSchema> {
  protected readonly logger: Logger;

  constructor(
    @Inject(DATABASE_CONNECTION)
    protected readonly database: NeonHttpDatabase<DatabaseSchema>,
    protected readonly tableName: TTableName,
    logger?: Logger,
  ) {
    this.logger = logger || new Logger(`BaseRepository:${String(tableName)}`);
  }

  // Relational query methods
  findMany(
    options?: Parameters<
      NeonHttpDatabase<DatabaseSchema>['query'][TTableName]['findMany']
    >[0],
  ) {
    return this.database.query[this.tableName].findMany(options) as Promise<
      SelectType<TTableName>[]
    >;
  }

  findFirst(
    options?: Parameters<
      NeonHttpDatabase<DatabaseSchema>['query'][TTableName]['findFirst']
    >[0],
  ) {
    return this.database.query[this.tableName].findFirst(options) as Promise<
      SelectType<TTableName> | undefined
    >;
  }

  // Alias for findFirst for convenience
  findOne(
    options?: Parameters<
      NeonHttpDatabase<DatabaseSchema>['query'][TTableName]['findFirst']
    >[0],
  ) {
    return this.findFirst(options);
  }

  // Traditional Drizzle methods for complex queries
  get table() {
    return schemas[this.tableName];
  }

  async create(data: Omit<InsertType<TTableName>, 'id'>) {
    const result = await this.database
      .insert(this.table)
      .values(data as any)
      .returning();
    return result[0] as SelectType<TTableName>;
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
    return result[0] as SelectType<TTableName>;
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
    return result[0] as SelectType<TTableName>;
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
  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return await this.database.transaction(callback);
  }

  // Get the query builder for this table
  get query() {
    return this.database.select().from(this.table as AnyPgTable);
  }
}
