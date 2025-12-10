import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JobsService } from './jobs.service';
import { OverdueReminderProcessor } from './processors/overdue-reminder.processor';
import { SessionCleanupProcessor } from './processors/session-cleanup.processor';
import { CreditReviewProcessor } from './processors/credit-review.processor';
import { DatabaseModule } from '@/libs/database';
import { EmailModule } from '@/email/email.module';
import { UsersModule } from '@/users/users.module';
import { CreditModule } from '@/credit/credit.module';
import enviroments from '@/core/utils/enviroments';
import { JOB_QUEUES } from './constants';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>(enviroments.REDIS.HOST),
          port: configService.get<number>(enviroments.REDIS.PORT),
          password: configService.get<string>(enviroments.REDIS.PASSWORD),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: JOB_QUEUES.OVERDUE_REMINDERS },
      { name: JOB_QUEUES.SESSION_CLEANUP },
      { name: JOB_QUEUES.CREDIT_REVIEW },
    ),
    DatabaseModule,
    EmailModule,
    UsersModule,
    CreditModule,
  ],
  providers: [
    JobsService,
    OverdueReminderProcessor,
    SessionCleanupProcessor,
    CreditReviewProcessor,
  ],
  exports: [JobsService],
})
export class JobsModule {}
