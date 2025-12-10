import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JOB_QUEUES, JOB_PROCESSES } from './constants';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectQueue(JOB_QUEUES.OVERDUE_REMINDERS) private overdueQueue: Queue,
    @InjectQueue(JOB_QUEUES.SESSION_CLEANUP) private sessionQueue: Queue,
    @InjectQueue(JOB_QUEUES.CREDIT_REVIEW) private creditReviewQueue: Queue,
  ) {}

  /**
   * Overdue Payment Reminders - Runs weekly on Monday at 9 AM
   * Sends email reminders to users with outstanding balances
   * Weekly schedule reduces email fatigue for users
   */
  @Cron('0 9 * * 1') // Every Monday at 9 AM
  async handleOverdueReminders() {
    this.logger.log('Starting overdue payment reminders job...');
    await this.overdueQueue.add(JOB_PROCESSES.PROCESS_OVERDUE_REMINDERS, {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Stale Session Cleanup - Runs daily at 2 AM
   * Clears expired refresh tokens from users table
   * Daily schedule keeps database clean without user impact
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleStaleSessionCleanup() {
    this.logger.log('Starting stale session cleanup job...');
    await this.sessionQueue.add(JOB_PROCESSES.PROCESS_SESSION_CLEANUP, {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Credit Limit Review - Runs weekly on Monday at 10 AM
   * Alerts admins about applications stuck in pending/under_review
   * Weekly digest prevents admin notification spam
   */
  @Cron('0 10 * * 1') // Every Monday at 10 AM
  async handleCreditLimitReview() {
    this.logger.log('Starting credit limit review job...');
    await this.creditReviewQueue.add(JOB_PROCESSES.PROCESS_CREDIT_REVIEW, {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Manual triggers for testing purposes
   */
  async triggerOverdueReminders() {
    return this.handleOverdueReminders();
  }

  async triggerSessionCleanup() {
    return this.handleStaleSessionCleanup();
  }

  async triggerCreditReview() {
    return this.handleCreditLimitReview();
  }
}
