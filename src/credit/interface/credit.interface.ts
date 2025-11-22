import { DBTableType } from '@/libs/database';

export enum CreditStatusEnum {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

export enum ApplicationStatusEnum {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum TransactionTypeEnum {
  DRAWDOWN = 'drawdown',
  REPAYMENT = 'repayment',
  ADJUSTMENT = 'adjustment',
}

export interface CreditRequestWithUser extends DBTableType<'creditRequests'> {
  credit: {
    user: {
      id: string;
      email: string;
    };
  };
}

export interface CreditApplicationWithUser
  extends DBTableType<'creditLimitApplications'> {
  credit: {
    user: {
      id: string;
      email: string;
    };
  };
}
