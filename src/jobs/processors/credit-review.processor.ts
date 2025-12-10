import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { BaseRepository, RepositoryFactory } from '@/libs/database';
import { EmailService } from '@/email/email.service';
import { JOB_QUEUES, JOB_PROCESSES } from '../constants';
import enviroments from '@/core/utils/enviroments';

@Processor(JOB_QUEUES.CREDIT_REVIEW)
export class CreditReviewProcessor {
  private readonly logger = new Logger(CreditReviewProcessor.name);
  private readonly creditLimitsRepository: BaseRepository<'creditLimitApplications'>;
  private readonly creditRequestsRepository: BaseRepository<'creditRequests'>;
  private readonly usersRepository: BaseRepository<'users'>;
  private reviewThresholdDays: number;

  constructor(
    private readonly repositoryFactory: RepositoryFactory,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.creditLimitsRepository = this.repositoryFactory.create(
      'creditLimitApplications',
    );
    this.creditRequestsRepository =
      this.repositoryFactory.create('creditRequests');
    this.usersRepository = this.repositoryFactory.create('users');
    this.reviewThresholdDays =
      this.configService.get<number>(
        enviroments.JOBS.CREDIT_REVIEW_THRESHOLD_DAYS,
      ) || 3;
  }

  @Process(JOB_PROCESSES.PROCESS_CREDIT_REVIEW)
  async handleCreditReview(job: Job) {
    this.logger.log(`Processing credit review job ${job.id}...`);

    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - this.reviewThresholdDays);

      // Find stale credit limit applications
      const staleApplications = await this.creditLimitsRepository.findMany({
        where: (app, { inArray, lt, and }) =>
          and(
            inArray(app.status, ['pending', 'under_review']),
            lt(app.createdAt, thresholdDate),
          ),
        with: {
          credit: {
            with: {
              user: true,
            },
          },
        },
      });

      // Find stale credit requests
      const staleRequests = await this.creditRequestsRepository.findMany({
        where: (req, { inArray, lt, and }) =>
          and(
            inArray(req.status, ['pending', 'under_review']),
            lt(req.createdAt, thresholdDate),
          ),
        with: {
          credit: {
            with: {
              user: true,
            },
          },
        },
      });

      const totalStale = staleApplications.length + staleRequests.length;

      if (totalStale === 0) {
        this.logger.log('No stale credit applications or requests found');
        return { staleApplications: 0, staleRequests: 0 };
      }

      // Get all admin users
      const adminUsers = await this.usersRepository.findMany({
        where: (user, { eq }) => eq(user.role, 'admin'),
        columns: {
          id: true,
          email: true,
        },
      });

      if (adminUsers.length === 0) {
        this.logger.warn('No admin users found to notify');
        return {
          staleApplications: staleApplications.length,
          staleRequests: staleRequests.length,
          notified: 0,
        };
      }

      // Build notification content
      const content = this.buildNotificationContent(
        staleApplications,
        staleRequests,
      );

      // Send notification to all admins
      let notifiedCount = 0;
      for (const admin of adminUsers) {
        try {
          await this.emailService.sendNotification({
            to: admin.email,
            notificationId: 'staleCreditReviewAlert',
            content,
          });
          notifiedCount++;
          this.logger.log(`Sent stale review alert to admin ${admin.email}`);
        } catch (error) {
          this.logger.error(
            `Failed to notify admin ${admin.email}: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `Credit review job completed. Found ${totalStale} stale items, notified ${notifiedCount} admins`,
      );

      return {
        staleApplications: staleApplications.length,
        staleRequests: staleRequests.length,
        notified: notifiedCount,
      };
    } catch (error) {
      this.logger.error(`Failed to process credit review: ${error.message}`);
      throw error;
    }
  }

  private buildNotificationContent(
    applications: any[],
    requests: any[],
  ): string {
    const lines: string[] = [];

    if (applications.length > 0) {
      lines.push(
        `${applications.length} Credit Limit Application(s) pending for more than ${this.reviewThresholdDays} days:`,
      );
      applications.slice(0, 5).forEach((app) => {
        const user = app.credit?.user;
        lines.push(
          `  - ${user?.email || 'Unknown'}: ₦${app.applicationAmount.toLocaleString()} (${app.status})`,
        );
      });
      if (applications.length > 5) {
        lines.push(`  ... and ${applications.length - 5} more`);
      }
    }

    if (requests.length > 0) {
      if (lines.length > 0) lines.push('');
      lines.push(
        `${requests.length} Credit Request(s) pending for more than ${this.reviewThresholdDays} days:`,
      );
      requests.slice(0, 5).forEach((req) => {
        const user = req.credit?.user;
        lines.push(
          `  - ${user?.email || 'Unknown'}: ₦${req.requestAmount.toLocaleString()} (${req.status})`,
        );
      });
      if (requests.length > 5) {
        lines.push(`  ... and ${requests.length - 5} more`);
      }
    }

    return lines.join('\n');
  }
}
