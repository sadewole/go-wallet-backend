import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { DATABASE_CONNECTION, schemas } from './constant';
import { neon } from '@neondatabase/serverless';
import { RepositoryFactory } from './repository.factory';
import enviroments from '@/core/utils/enviroments';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.getOrThrow(enviroments.DATABASE_URL);
        const sql = neon(databaseUrl);
        return drizzle({ client: sql, schema: schemas });
      },
      inject: [ConfigService],
    },
    RepositoryFactory,
  ],
  exports: [DATABASE_CONNECTION, RepositoryFactory],
})
export class DatabaseModule {}
