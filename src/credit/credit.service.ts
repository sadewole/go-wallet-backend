import { BaseRepository, RepositoryFactory } from '@/libs/database';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreditApplicationDto } from './dtos/credit.dto';

@Injectable()
export class CreditService {
  private readonly creditRepository: BaseRepository<'credits'>;
  private readonly creditApplicationsRepository: BaseRepository<'creditApplications'>;
  private readonly creditRequestsRepository: BaseRepository<'creditRequests'>;
  private readonly creditTimelineRepository: BaseRepository<'creditTimeline'>;
  private readonly creditTransactionsRepository: BaseRepository<'creditTransactions'>;

  constructor(private readonly repositoryFactory: RepositoryFactory) {
    this.creditRepository = this.repositoryFactory.create('credits');
    this.creditApplicationsRepository =
      this.repositoryFactory.create('creditApplications');
    this.creditRequestsRepository =
      this.repositoryFactory.create('creditRequests');
    this.creditTimelineRepository =
      this.repositoryFactory.create('creditTimeline');
    this.creditTransactionsRepository =
      this.repositoryFactory.create('creditTransactions');
  }

  async createCreditApplication(data: CreditApplicationDto, userId: string) {
    const findExistingApplication =
      await this.creditApplicationsRepository.findFirst({
        where: (application, { eq, and }) =>
          and(
            eq(application.userId, userId),
            eq(application.status, 'pending'),
          ),
      });

    if (findExistingApplication) {
      throw new BadRequestException(
        'You already have a pending credit application. Please wait for it to be processed before applying again.',
      );
    }

    return this.creditApplicationsRepository.create({
      ...data,
      userId,
    });
  }
}
