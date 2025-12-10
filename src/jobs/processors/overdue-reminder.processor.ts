import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { BaseRepository, RepositoryFactory } from '@/libs/database';
import { EmailService } from '@/email/email.service';
import { JOB_QUEUES, JOB_PROCESSES } from '../constants';
import enviroments from '@/core/utils/enviroments';

@Processor(JOB_QUEUES.OVERDUE_REMINDERS)
export class OverdueReminderProcessor {
  private readonly logger = new Logger(OverdueReminderProcessor.name);
  private readonly creditsRepository: BaseRepository<'credits'>;
  private readonly usersRepository: BaseRepository<'users'>;
  private overdueThresholdDays: number;

  constructor(
    private readonly repositoryFactory: RepositoryFactory,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.creditsRepository = this.repositoryFactory.create('credits');
    this.usersRepository = this.repositoryFactory.create('users');
    this.overdueThresholdDays =
      this.configService.get<number>(enviroments.JOBS.OVERDUE_THRESHOLD_DAYS) ||
      7;
  }

  @Process(JOB_PROCESSES.PROCESS_OVERDUE_REMINDERS)
  async handleOverdueReminders(job: Job) {
    this.logger.log(`Processing overdue reminders job ${job.id}...`);

    try {
      // Find credits with outstanding balance > 0
      const overdueCredits = await this.creditsRepository.findMany({
        where: (credit, { gt }) => gt(credit.outstanding, 0),
        with: {
          user: true,
        },
      });

      if (overdueCredits.length === 0) {
        this.logger.log('No overdue payments found');
        return { processed: 0 };
      }

      let sentCount = 0;
      for (const credit of overdueCredits) {
        const user = (credit as any).user;
        if (!user?.email) continue;

        try {
          await this.emailService.sendNotification({
            to: user.email,
            notificationId: 'overduePaymentReminder',
            content: `Outstanding balance: ₦${credit.outstanding.toLocaleString()}`,
          });
          sentCount++;
          this.logger.log(
            `Sent overdue reminder to ${user.email} for ₦${credit.outstanding}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send reminder to ${user.email}: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `Overdue reminders job completed. Sent ${sentCount}/${overdueCredits.length} emails`,
      );
      return { processed: sentCount, total: overdueCredits.length };
    } catch (error) {
      this.logger.error(
        `Failed to process overdue reminders: ${error.message}`,
      );
      throw error;
    }
  }
}
