import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import enviroments from '@/core/utils/enviroments';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        stores: [createKeyv(configService.get(enviroments.REDIS.URL))],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
