import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { BaseRepository, RepositoryFactory } from '@/libs/database';
import { JOB_QUEUES, JOB_PROCESSES } from '../constants';
import enviroments from '@/core/utils/enviroments';

@Processor(JOB_QUEUES.SESSION_CLEANUP)
export class SessionCleanupProcessor {
  private readonly logger = new Logger(SessionCleanupProcessor.name);
  private readonly usersRepository: BaseRepository<'users'>;
  private sessionExpiryDays: number;

  constructor(
    private readonly repositoryFactory: RepositoryFactory,
    private readonly configService: ConfigService,
  ) {
    this.usersRepository = this.repositoryFactory.create('users');
    this.sessionExpiryDays =
      this.configService.get<number>(enviroments.JOBS.SESSION_EXPIRY_DAYS) || 7;
  }

  @Process(JOB_PROCESSES.PROCESS_SESSION_CLEANUP)
  async handleSessionCleanup(job: Job) {
    this.logger.log(`Processing session cleanup job ${job.id}...`);

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - this.sessionExpiryDays);

      // Find users with refresh tokens that have expired (lastLogin > sessionExpiryDays ago)
      const staleUsers = await this.usersRepository.findMany({
        where: (user, { isNotNull, lt, and }) =>
          and(isNotNull(user.refreshToken), lt(user.lastLogin, expiryDate)),
        columns: {
          id: true,
          email: true,
          lastLogin: true,
        },
      });

      if (staleUsers.length === 0) {
        this.logger.log('No stale sessions found');
        return { cleaned: 0 };
      }

      // Clear refresh tokens for stale users
      let cleanedCount = 0;
      for (const user of staleUsers) {
        try {
          await this.usersRepository.update(user.id, { refreshToken: null });
          cleanedCount++;
          this.logger.debug(`Cleared stale session for user ${user.email}`);
        } catch (error) {
          this.logger.error(
            `Failed to clear session for user ${user.id}: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `Session cleanup completed. Cleared ${cleanedCount}/${staleUsers.length} stale sessions`,
      );
      return { cleaned: cleanedCount, total: staleUsers.length };
    } catch (error) {
      this.logger.error(`Failed to process session cleanup: ${error.message}`);
      throw error;
    }
  }
}
