import { BaseRepository, RepositoryFactory } from '@/libs/database';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreditApplicationDto, CreditRequestDto } from './dtos/credit.dto';

@Injectable()
export class CreditService {
  private readonly creditRepository: BaseRepository<'credits'>;
  private readonly creditLimitsRepository: BaseRepository<'creditLimitApplications'>;
  private readonly creditRequestsRepository: BaseRepository<'creditRequests'>;
  private readonly creditTimelineRepository: BaseRepository<'creditTimeline'>;
  private readonly creditTransactionsRepository: BaseRepository<'creditTransactions'>;

  constructor(private readonly repositoryFactory: RepositoryFactory) {
    this.creditRepository = this.repositoryFactory.create('credits');
    this.creditLimitsRepository = this.repositoryFactory.create(
      'creditLimitApplications',
    );
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

  async createCreditLimit(data: CreditApplicationDto, creditId: string) {
    return this.creditLimitsRepository.transaction(async (tx) => {
      const txCreditLimitRepo = this.creditLimitsRepository.withTransaction(tx);
      const txTimelineRepo = this.creditTimelineRepository.withTransaction(tx);

      const findExistingApplication = await txCreditLimitRepo.findFirst({
        where: (application, { eq, and, inArray }) =>
          and(
            eq(application.creditId, creditId),
            inArray(application.status, ['pending', 'under_review']),
          ),
      });

      if (findExistingApplication) {
        throw new BadRequestException(
          'You already have a pending credit application. Please wait for it to be processed before applying again.',
        );
      }

      const creditLimit = await txCreditLimitRepo.create({
        ...data,
        creditId,
      });

      await txTimelineRepo.create({
        status: 'pending',
        entityType: 'credit_application',
        entityId: creditLimit.id,
        note: `Credit application created with amount ${data.applicationAmount}`,
      });

      return creditLimit;
    });
  }

  async updateCreditLimit(data: CreditApplicationDto, id: string) {
    const existingLimit = await this.creditLimitsRepository.findOne({
      where: (application, { eq }) => eq(application.id, id),
    });
    if (!existingLimit) {
      throw new BadRequestException('Credit application not found.');
    }

    if (existingLimit.status !== 'pending') {
      throw new BadRequestException(
        'Only pending applications can be updated.',
      );
    }

    return this.creditLimitsRepository.update(id, data);
  }

  async getAllCreditLimits(creditId: string) {
    return this.creditLimitsRepository.findMany({
      where: (application, { eq }) => eq(application.creditId, creditId),
      orderBy: (application, { desc }) => [desc(application.createdAt)],
    });
  }

  async getCreditLimitById(id: string) {
    const application = await this.creditLimitsRepository.findFirst({
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

      if (credit.status !== 'active') {
        throw new UnauthorizedException(
          'Your credit account is not active, kindly apply for appeal to enable this process',
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

      if (data.requestAmount > credit.limit - credit.available) {
        throw new BadRequestException(
          'Requested amount exceeds available credit limit.',
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
