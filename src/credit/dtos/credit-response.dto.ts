import { ApiProperty } from '@nestjs/swagger';
import {
  ApplicationStatusEnum,
  CreditStatusEnum,
  TransactionTypeEnum,
} from '../interface/credit.interface';
import { BusinessDoc } from './credit.dto';

export class CreditResponse {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({ example: 500000 })
  creditLimit: number;

  @ApiProperty({ example: 200000 })
  spendableAmount: number;

  @ApiProperty({ example: 300000 })
  availableCredit: number;

  @ApiProperty({ example: 200000 })
  outstanding: number;

  @ApiProperty({ example: 'active' })
  status: CreditStatusEnum;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-10-01T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-10-01T12:00:00.000Z',
  })
  updatedAt: string;
}

export class CreditApplicationResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  creditId: string;

  @ApiProperty({ example: '12345678901' })
  bvn: string;

  @ApiProperty({ type: [BusinessDoc] })
  businessDocs: BusinessDoc[];

  @ApiProperty({ example: 500000 })
  applicationAmount: number;

  @ApiProperty({ example: 400000 })
  approvedAmount: number;

  @ApiProperty({ example: '2025-10-01T12:00:00.000Z' })
  approvedDate: string;

  @ApiProperty({ example: 'pending', enum: ApplicationStatusEnum })
  status: ApplicationStatusEnum;

  @ApiProperty({ example: 'Insufficient credit score' })
  rejectionReason: string;

  @ApiProperty({ example: 'Expand business operations' })
  purposeOfLoan: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-10-01T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-10-01T12:00:00.000Z',
  })
  updatedAt: string;
}

export class CreditTimelineResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiProperty({ example: 'credit_application' })
  entityType: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  entityId: string;

  @ApiProperty({ example: 'Credit application created with amount 500000' })
  note: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-10-01T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-10-01T12:00:00.000Z',
  })
  updatedAt: string;
}

export class CreditApplicationWithTimelineResponse extends CreditApplicationResponse {
  @ApiProperty({ type: [CreditTimelineResponse] })
  timeline: CreditTimelineResponse[];
}

export class CreditRequestResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 300000 })
  requestAmount: number;

  @ApiProperty({ example: 250000 })
  approvedAmount: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  creditId: string;

  @ApiProperty({ example: 'pending', enum: ApplicationStatusEnum })
  status: ApplicationStatusEnum;

  @ApiProperty({ example: 'Insufficient credit limit' })
  rejectionReason: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-10-01T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-10-01T12:00:00.000Z',
  })
  updatedAt: string;
}

export class CreditRequestWithTimelineResponse extends CreditRequestResponse {
  @ApiProperty({ type: [CreditTimelineResponse] })
  timeline: CreditTimelineResponse[];
}

export class CreditTransactionResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  creditId: string;

  @ApiProperty({ example: 150000 })
  amount: number;

  @ApiProperty({ example: 150000 })
  runningBalance: number;

  @ApiProperty({ example: 'repayment', enum: TransactionTypeEnum })
  type: TransactionTypeEnum;

  @ApiProperty({ example: 'Credit repayment' })
  description: string;

  @ApiProperty({ example: '23454367' })
  reference: string;

  @ApiProperty({ example: { some: 'data' } })
  metadata: object;

  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-10-01T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-10-01T12:00:00.000Z',
  })
  updatedAt: string;
}
