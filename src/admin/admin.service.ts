import { CreditRepositoryManager } from '@/credit/credit-repository.manager';
import { UserRepository } from '@/users/users.repository';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cRepoManager: CreditRepositoryManager,
    private logger: Logger,
  ) {}

  async getAllUsers() {
    return this.userRepository.findMany({
      columns: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        lastLogin: true,
        createdAt: true,
      },
      with: { credit: true },
    });
  }

  async suspendCreditAccount(creditId: string) {
    const credit = await this.cRepoManager.credit.findOne({
      where: (c, { eq }) => eq(c.id, creditId),
    });

    if (!credit) {
      throw new NotFoundException('Credit account not found');
    }

    if (credit.status === 'suspended') {
      throw new BadRequestException('Credit account is already suspended');
    }
    return this.cRepoManager.credit.update(creditId, {
      status: 'suspended',
    });
  }

  async activateCreditAccount(creditId: string) {
    const credit = await this.cRepoManager.credit.findOne({
      where: (c, { eq }) => eq(c.id, creditId),
    });

    if (!credit) {
      throw new NotFoundException('Credit account not found');
    }

    if (credit.status === 'active') {
      throw new Error('Credit account is already active');
    }
    return this.cRepoManager.credit.update(creditId, {
      status: 'active',
    });
  }

  async getAllCreditApplications() {
    return this.cRepoManager.creditLimits.findMany({
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
    return this.cRepoManager.creditTransactions.findMany({
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
    return this.cRepoManager.creditRequests.findMany({
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

  async approveCreditRequest(requestId: string) {}

  async rejectCreditRequest(requestId: string) {}

  async approveCreditApplication(applicationId: string, approvedBy: string) {
    const application = await this.cRepoManager.creditLimits.findOne({
      where: (app, { eq, and, inArray }) =>
        and(
          eq(app.id, applicationId),
          inArray(app.status, ['pending', 'under_review']),
        ),
    });

    if (!application) {
      throw new NotFoundException(
        'Credit limit application not found or cannot be approved',
      );
    }

    return this.cRepoManager.creditLimits.transaction(async (tx) => {
      const txCreditRepo = this.cRepoManager.credit.withTransaction(tx);
      const txTimelineRepo =
        this.cRepoManager.creditTimeline.withTransaction(tx);
      const txApplicationRepo =
        this.cRepoManager.creditLimits.withTransaction(tx);

      // Get current credit account state within the transaction
      const creditAccount = await txCreditRepo.findOne({
        where: (credit, { eq }) => eq(credit.id, application.creditId),
      });

      if (!creditAccount) {
        throw new NotFoundException('Credit account not found');
      }

      // Calculate available amount (ensure it doesn't go negative)
      const outstanding = creditAccount.outstanding || 0;
      const availableAmount = Math.max(
        0,
        application.applicationAmount - outstanding,
      );

      // approve credit limit
      await txApplicationRepo.update(application.id, {
        status: 'approved',
        approvedAmount: application.applicationAmount,
        approvedDate: new Date(),
      });
      // update credit account limit
      await txCreditRepo.update(application.creditId, {
        limit: application.applicationAmount,
        available: availableAmount,
      });
      // save timeline
      await txTimelineRepo.create({
        status: 'approved',
        entityType: 'credit_application',
        entityId: application.id,
        note: `Credit application approved with amount ${application.applicationAmount.toLocaleString()}`,
        changedBy: approvedBy,
        metadata: {
          previousStatus: application.status,
          approvedAmount: application.applicationAmount,
          previousLimit: creditAccount.limit,
          newLimit: application.applicationAmount,
          outstandingAmount: outstanding,
          availableAmount: availableAmount,
        },
      });

      // send email notification (omitted for brevity)

      // emit event (omitted for brevity)

      return {
        id: applicationId,
        status: 'approved',
        approvedAmount: application.applicationAmount,
        approvedDate: new Date(),
        creditId: application.creditId,
        availableAmount: availableAmount,
      };
    });
  }

  async rejectCreditApplication(applicationId: string) {
    const application = await this.cRepoManager.creditLimits.findOne({
      where: (app, { eq, and, inArray }) =>
        and(
          eq(app.id, applicationId),
          inArray(app.status, ['pending', 'under_review']),
        ),
    });

    if (!application) {
      throw new NotFoundException(
        'Credit limit application not found or cannot be rejected',
      );
    }
    return this.cRepoManager.creditLimits.update(applicationId, {
      status: 'rejected',
    });
  }

  // private async emitCreditApprovedEvent(eventData: {
  //   applicationId: string;
  //   creditId: string;
  //   approvedAmount: number;
  //   approvedBy: string;
  //   previousLimit: number;
  //   customerId?: string;
  // }) {
  //   try {
  //     await this.eventEmitter.emit('credit.application.approved', eventData);
  //   } catch (error) {
  //     // Don't fail the main operation if event emitting fails
  //     this.logger.warn('Failed to emit credit approval event', error);
  //   }
  // }
}
