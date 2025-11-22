import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';
import { DATABASE_CONNECTION, schemas } from './constant';
import { RepositoryFactory } from './repository.factory';
import enviroments from '@/core/utils/enviroments';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.getOrThrow(enviroments.DATABASE_URL);
        const client = postgres(databaseUrl);
        return drizzle({ client, schema: schemas });
      },
      inject: [ConfigService],
    },
    RepositoryFactory,
  ],
  exports: [DATABASE_CONNECTION, RepositoryFactory],
})
export class DatabaseModule {}
