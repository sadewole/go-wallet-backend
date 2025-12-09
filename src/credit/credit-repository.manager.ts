import {
  BaseRepository,
  DBTableType,
  RepositoryFactory,
} from '@/libs/database';
import {
  ApplicationStatusEnum,
  CreditApplicationWithUser,
  CreditRequestWithUser,
} from './interface/credit.interface';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
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

  async findValidRequest(requestId: string): Promise<CreditRequestWithUser> {
    const request = (await this.creditRequests.findOne({
      where: (req, { eq, and, inArray }) =>
        and(
          eq(req.id, requestId),
          inArray(req.status, [
            ApplicationStatusEnum.PENDING,
            ApplicationStatusEnum.UNDER_REVIEW,
          ]),
        ),
      with: {
        credit: {
          with: {
            user: {
              columns: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    })) as CreditRequestWithUser | undefined;

    if (!request) {
      throw new NotFoundException(
        'Credit request not found or cannot be approved',
      );
    }

    return request;
  }

  async findValidApplication(
    applicationId: string,
  ): Promise<CreditApplicationWithUser> {
    const application = (await this.creditLimits.findOne({
      where: (app, { eq, and, inArray }) =>
        and(
          eq(app.id, applicationId),
          inArray(app.status, [
            ApplicationStatusEnum.PENDING,
            ApplicationStatusEnum.UNDER_REVIEW,
          ]),
        ),
      with: {
        credit: {
          with: {
            user: {
              columns: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    })) as CreditApplicationWithUser | undefined;

    if (!application) {
      throw new NotFoundException(
        'Credit limit application not found or cannot be approved',
      );
    }

    return application;
  }

  async validateCreditAccount(
    creditId: string,
  ): Promise<DBTableType<'credits'>> {
    const credit = await this.credit.findOne({
      where: (c, { eq }) => eq(c.id, creditId),
    });

    if (!credit) {
      throw new NotFoundException('Credit account not found');
    }

    return credit;
  }

  async updateCreditStatus(creditId: string, status: 'active' | 'suspended') {
    const credit = await this.validateCreditAccount(creditId);

    if (status === 'suspended') {
      this.validateCreditStatus(
        credit,
        'suspended',
        'Credit account is already suspended',
      );
    } else {
      this.validateCreditStatus(
        credit,
        'active',
        'Credit account is already active',
      );
    }

    return await this.credit.update(creditId, { status });
  }

  private validateCreditStatus(
    credit: any,
    expectedStatus: string,
    errorMessage: string,
  ): void {
    if (credit.status === expectedStatus) {
      throw new BadRequestException(errorMessage);
    }
  }

  //   QUERY METHODS
  async getAllCreditApplications() {
    return this.creditLimits.findMany({
      with: {
        credit: {
          with: {
            user: {
              columns: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: (application, { desc }) => [desc(application.createdAt)],
    });
  }

  async getAllTransactions() {
    return this.creditTransactions.findMany({
      with: {
        credit: {
          with: {
            user: {
              columns: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: (transaction, { desc }) => [desc(transaction.createdAt)],
    });
  }

  async getAllCreditRequests() {
    return await this.creditRequests.findMany({
      with: {
        credit: {
          with: {
            user: {
              columns: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: (request, { desc }) => [desc(request.createdAt)],
    });
  }
}
