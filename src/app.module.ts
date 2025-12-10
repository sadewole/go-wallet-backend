import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, SeedModule } from './libs/database';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from './libs/cache/cache.module';
import { CreditModule } from './credit/credit.module';
import { AdminModule } from './admin/admin.module';
import { StorageModule } from './storage/storage.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    DatabaseModule,
    UsersModule,
    AuthModule,
    CacheModule,
    CreditModule,
    StorageModule,
    AdminModule,
    SeedModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
