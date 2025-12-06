import { CreditRepositoryManager } from '@/credit/credit-repository.manager';
import { EmailService } from '@/email/email.service';
import { DBTableType } from '@/libs/database';
import { UserRepository } from '@/users/users.repository';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AdjustCreditDto } from './dtos/credit.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly cRepoManager: CreditRepositoryManager,
    private readonly emailService: EmailService,
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
    return this.cRepoManager.updateCreditStatus(creditId, 'suspended');
  }

  async activateCreditAccount(creditId: string) {
    return this.cRepoManager.updateCreditStatus(creditId, 'active');
  }

  async getAllCreditApplications() {
    return this.cRepoManager.getAllCreditApplications();
  }

  async getAllTransactions() {
    return this.cRepoManager.getAllTransactions();
  }

  async getAllCreditRequests() {
    return this.cRepoManager.getAllCreditRequests();
  }

  async approveCreditRequest(requestId: string, approvedBy: string) {
    const request = await this.cRepoManager.findValidRequest(requestId);

    return this.cRepoManager.creditRequests.transaction(async (tx) => {
      const txCreditRepo = this.cRepoManager.credit.withTransaction(tx);
      const txTimelineRepo =
        this.cRepoManager.creditTimeline.withTransaction(tx);
      const txRequestRepo =
        this.cRepoManager.creditRequests.withTransaction(tx);
      const txTransactionsRepo =
        this.cRepoManager.creditTransactions.withTransaction(tx);

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

      // save transaction
      await txTransactionsRepo.create({
        creditId: request.creditId,
        amount: request.requestAmount,
        type: 'drawdown',
        runningBalance: newOutstanding,
        description: 'Credit request approved (Drawdown)',
        status: 'success',
        metadata: {
          requestId: request.id,
          approvedBy,
        },
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
        notificationId: 'creditRequestApproved',
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
    const request = await this.cRepoManager.findValidRequest(requestId);

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
    const application =
      await this.cRepoManager.findValidApplication(applicationId);

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
        notificationId: 'creditApproved',
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
    const application =
      await this.cRepoManager.findValidApplication(applicationId);

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

  async adjustCredit(creditId: string, data: AdjustCreditDto, adminId: string) {
    return this.cRepoManager.credit.transaction(async (tx) => {
      const txCreditRepo = this.cRepoManager.credit.withTransaction(tx);
      const txTransactionsRepo =
        this.cRepoManager.creditTransactions.withTransaction(tx);

      const credit = await txCreditRepo.findFirst({
        where: (credit, { eq }) => eq(credit.id, creditId),
      });

      if (!credit) {
        throw new BadRequestException('Credit account not found.');
      }

      const newOutstanding = credit.outstanding + data.amount;
      const newAvailable = credit.limit - newOutstanding;

      await txCreditRepo.update(credit.id, {
        outstanding: newOutstanding < 0 ? 0 : newOutstanding,
        available: newAvailable > credit.limit ? credit.limit : newAvailable,
      });

      const transaction = await txTransactionsRepo.create({
        creditId: credit.id,
        amount: Math.abs(data.amount),
        type: 'adjustment',
        runningBalance: newOutstanding < 0 ? 0 : newOutstanding,
        description: data.description,
        status: 'success',
        metadata: {
          adjustedBy: adminId,
          originalAmount: data.amount,
        },
      });

      return transaction;
    });
  }
}
