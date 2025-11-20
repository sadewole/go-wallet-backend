import { BaseRepository, RepositoryFactory } from '@/libs/database';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreditApplicationDto, CreditRequestDto } from './dtos/credit.dto';

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

  async getCredit(userId: string) {
    return this.creditRepository.findFirst({
      where: (credit, { eq }) => eq(credit.userId, userId),
    });
  }

  async createCreditApplication(data: CreditApplicationDto, userId: string) {
    return this.creditApplicationsRepository.transaction(async (tx) => {
      const txCreditAppRepo =
        this.creditApplicationsRepository.withTransaction(tx);
      const txTimelineRepo = this.creditTimelineRepository.withTransaction(tx);

      const findExistingApplication = await txCreditAppRepo.findFirst({
        where: (application, { eq, and, inArray }) =>
          and(
            eq(application.userId, userId),
            inArray(application.status, ['pending', 'under_review']),
          ),
      });

      if (findExistingApplication) {
        throw new BadRequestException(
          'You already have a pending credit application. Please wait for it to be processed before applying again.',
        );
      }

      const creditApplication = await txCreditAppRepo.create({
        ...data,
        userId,
      });

      await txTimelineRepo.create({
        status: 'pending',
        entityType: 'credit_application',
        entityId: creditApplication.id,
        note: `Credit application created with amount ${data.applicationAmount}`,
      });

      return creditApplication;
    });
  }

  async updateCreditApplication(data: CreditApplicationDto, id: string) {
    const existingApplication = await this.creditApplicationsRepository.findOne(
      {
        where: (application, { eq }) => eq(application.id, id),
      },
    );
    if (!existingApplication) {
      throw new BadRequestException('Credit application not found.');
    }

    if (existingApplication.status !== 'pending') {
      throw new BadRequestException(
        'Only pending applications can be updated.',
      );
    }

    return this.creditApplicationsRepository.update(id, data);
  }

  async getAllCreditApplications(userId: string) {
    return this.creditApplicationsRepository.findMany({
      where: (application, { eq }) => eq(application.userId, userId),
      orderBy: (application, { desc }) => [desc(application.createdAt)],
    });
  }

  async getCreditApplicationById(id: string) {
    const application = await this.creditApplicationsRepository.findFirst({
      where: (application, { eq }) => eq(application.id, id),
    });

    if (!application) {
      throw new BadRequestException('Credit application not found.');
    }

    const timelines = await this.creditTimelineRepository.findMany({
      where: (timeline, { eq }) => eq(timeline.entityId, application.id),
    });

    (application as any).timelines = timelines;

    return application;
  }

  async creditRequest(data: CreditRequestDto, userId: string) {
    return this.creditRequestsRepository.transaction(async (tx) => {
      const txCreditRequestRepo =
        this.creditRequestsRepository.withTransaction(tx);
      const txTimelineRepo = this.creditTimelineRepository.withTransaction(tx);

      const credit = await this.creditRepository.findFirst({
        where: (credit, { eq }) => eq(credit.userId, userId),
      });

      if (!credit) {
        throw new BadRequestException(
          'No credit account found. Please apply for credit first.',
        );
      }

      const findExistingRequest = await txCreditRequestRepo.findFirst({
        where: (request, { eq, inArray, and }) =>
          and(
            eq(request.creditId, credit.id),
            inArray(request.status, ['pending', 'under_review']),
          ),
      });

      if (findExistingRequest) {
        throw new BadRequestException(
          'You already have a pending credit request. Please wait for it to be processed before making another request.',
        );
      }

      const creditRequest = await txCreditRequestRepo.create({
        ...data,
        creditId: credit.id,
      });

      await txTimelineRepo.create({
        status: 'pending',
        entityType: 'credit_request',
        entityId: creditRequest.id,
        changedBy: userId,
        note: `Credit request created with amount ${data.requestAmount}`,
      });

      return creditRequest;
    });
  }

  async getCreditTransactions(userId: string) {
    const credit = await this.creditRepository.findFirst({
      where: (credit, { eq }) => eq(credit.userId, userId),
    });

    if (!credit) {
      throw new BadRequestException('Credit account not found for the user.');
    }

    const creditId = credit.id;
    return this.creditTransactionsRepository.findMany({
      where: (transaction, { eq }) => eq(transaction.creditId, creditId),
    });
  }
}
