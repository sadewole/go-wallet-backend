import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BusinessDoc {
  @IsString()
  @ApiProperty()
  key: string;

  @IsString()
  @ApiProperty()
  url: string;
}

export class CreditApplicationDto {
  @IsString()
  @ApiProperty()
  bvn: string;

  @IsNumber()
  @ApiProperty()
  @Min(1000, { message: 'Application amount must be a positive number' })
  @Max(1000000, { message: 'Application amount exceeds the maximum limit' })
  applicationAmount: number;

  @ApiProperty({ type: [BusinessDoc] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessDoc)
  businessDocs: BusinessDoc[];

  @IsString()
  @IsOptional()
  @ApiProperty()
  purposeOfLoan?: string;
}

export class CreditRequestDto {
  @IsNumber()
  @Min(0, { message: 'Request amount must be a positive number' })
  @ApiProperty()
  requestAmount: number;
}

export class CreditRepaymentDto {
  @IsNumber()
  @Min(1000, { message: 'Repayment amount must be at least 1000' })
  @ApiProperty()
  amount: number;
}

export class VerifyRepaymentDto {
  @IsString()
  @ApiProperty()
  reference: string;
}
