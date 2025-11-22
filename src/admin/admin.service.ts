import { CreditRepositoryManager } from '@/credit/credit-repository.manager';
import { EmailService } from '@/email/email.service';
import { DBTableType } from '@/libs/database';
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
    private readonly emailService: EmailService,
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
      throw new BadRequestException('Credit account is already active');
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

  async approveCreditRequest(requestId: string, approvedBy: string) {
    const request = await this.cRepoManager.creditRequests.findOne({
      where: (req, { eq, and, inArray }) =>
        and(
          eq(req.id, requestId),
          inArray(req.status, ['pending', 'under_review']),
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
    });

    if (!request) {
      throw new NotFoundException(
        'Credit request not found or cannot be approved',
      );
    }

    return this.cRepoManager.creditRequests.transaction(async (tx) => {
      const txCreditRepo = this.cRepoManager.credit.withTransaction(tx);
      const txTimelineRepo =
        this.cRepoManager.creditTimeline.withTransaction(tx);
      const txRequestRepo =
        this.cRepoManager.creditRequests.withTransaction(tx);

      // approve credit request
      await txRequestRepo.update(request.id, {
        status: 'approved',
        approvedAmount: request.requestAmount,
        approvedDate: new Date(),
      });

      const creditAccount = (request as any)?.credit as DBTableType<'credits'>;
      const availableAmount = Math.max(
        0,
        creditAccount.limit -
          (creditAccount.outstanding + request.requestAmount),
      );
      const newOutstanding =
        (creditAccount.outstanding || 0) + request.requestAmount;
      const newSpendableAmount =
        (creditAccount.spendableAmount || 0) + request.requestAmount;

      await txCreditRepo.update(request.creditId, {
        available: availableAmount,
        outstanding: newOutstanding,
        spendableAmount: newSpendableAmount,
      });

      // save timeline
      await txTimelineRepo.create({
        status: 'approved',
        entityType: 'credit_request',
        entityId: request.id,
        note: `Credit request approved with amount ${request.requestAmount.toLocaleString()}`,
        changedBy: approvedBy,
        metadata: {
          previousStatus: request.status,
          approvedAmount: request.requestAmount,
        },
      });

      // send email notification
      await this.emailService.sendNotification({
        to: (request as any).credit.user.email,
        notificationId: 'creditRejected',
      });

      return {
        id: requestId,
        status: 'approved',
        approvedAmount: request.requestAmount,
        approvedDate: new Date(),
        creditId: request.creditId,
      };
    });
  }

  async rejectCreditRequest(
    requestId: string,
    rejectedBy: string,
    note: string,
  ) {
    const request = await this.cRepoManager.creditRequests.findOne({
      where: (req, { eq, and, inArray }) =>
        and(
          eq(req.id, requestId),
          inArray(req.status, ['pending', 'under_review']),
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
    });

    if (!request) {
      throw new NotFoundException(
        'Credit request not found or cannot be rejected',
      );
    }

    return this.cRepoManager.creditRequests.transaction(async (tx) => {
      const txTimelineRepo =
        this.cRepoManager.creditTimeline.withTransaction(tx);
      const txRequestRepo =
        this.cRepoManager.creditRequests.withTransaction(tx);

      await txRequestRepo.update(requestId, {
        status: 'rejected',
        rejectionReason: note,
      });

      await txTimelineRepo.create({
        status: 'rejected',
        entityType: 'credit_request',
        entityId: request.id,
        note: `Credit request rejected: ${note}`,
        changedBy: rejectedBy,
      });

      await this.emailService.sendNotification({
        to: (request as any).credit.user.email,
        notificationId: 'creditRequestRejected',
      });

      return {
        id: requestId,
        status: 'rejected',
        approvedAmount: request.requestAmount,
        rejectedDate: new Date(),
        creditId: request.creditId,
      };
    });
  }

  async approveCreditApplication(applicationId: string, approvedBy: string) {
    const application = await this.cRepoManager.creditLimits.findOne({
      where: (app, { eq, and, inArray }) =>
        and(
          eq(app.id, applicationId),
          inArray(app.status, ['pending', 'under_review']),
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

      const creditAccount = (application as any)
        ?.credit as DBTableType<'credits'>;

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

      // send email notification
      await this.emailService.sendNotification({
        to: (application as any).credit.user.email,
        notificationId: 'creditRejected',
      });

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

  async rejectCreditApplication(
    applicationId: string,
    rejectedBy: string,
    note: string,
  ) {
    const application = await this.cRepoManager.creditLimits.findOne({
      where: (app, { eq, and, inArray }) =>
        and(
          eq(app.id, applicationId),
          inArray(app.status, ['pending', 'under_review']),
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
    });

    if (!application) {
      throw new NotFoundException(
        'Credit limit application not found or cannot be rejected',
      );
    }

    return this.cRepoManager.creditLimits.transaction(async (tx) => {
      const txTimelineRepo =
        this.cRepoManager.creditTimeline.withTransaction(tx);
      const txApplicationRepo =
        this.cRepoManager.creditLimits.withTransaction(tx);

      await txApplicationRepo.update(applicationId, {
        status: 'rejected',
        rejectionReason: note,
      });

      await txTimelineRepo.create({
        status: 'rejected',
        entityType: 'credit_application',
        entityId: application.id,
        note: `Credit application rejected: ${note}`,
        changedBy: rejectedBy,
      });

      await this.emailService.sendNotification({
        to: (application as any).credit.user.email,
        notificationId: 'creditRejected',
      });

      return {
        id: applicationId,
        status: 'rejected',
        approvedAmount: application.applicationAmount,
        rejectedDate: new Date(),
        creditId: application.creditId,
      };
    });
  }
}
