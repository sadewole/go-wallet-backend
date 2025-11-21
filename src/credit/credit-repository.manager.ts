import { BaseRepository, RepositoryFactory } from '@/libs/database';

export class CreditRepositoryManager {
  public readonly credit: BaseRepository<'credits'>;
  public readonly creditLimits: BaseRepository<'creditLimitApplications'>;
  public readonly creditRequests: BaseRepository<'creditRequests'>;
  public readonly creditTimeline: BaseRepository<'creditTimeline'>;
  public readonly creditTransactions: BaseRepository<'creditTransactions'>;

  constructor(private readonly repositoryFactory: RepositoryFactory) {
    this.credit = this.repositoryFactory.create('credits');
    this.creditLimits = this.repositoryFactory.create(
      'creditLimitApplications',
    );
    this.creditRequests = this.repositoryFactory.create('creditRequests');
    this.creditTimeline = this.repositoryFactory.create('creditTimeline');
    this.creditTransactions =
      this.repositoryFactory.create('creditTransactions');
  }
}
