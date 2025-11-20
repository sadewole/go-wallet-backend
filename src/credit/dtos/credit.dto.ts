import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsPositive, IsOptional } from 'class-validator';

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
  @IsPositive()
  @ApiProperty()
  applicationAmount: number;

  @ApiProperty({ type: [BusinessDoc] })
  @IsString({ each: true })
  businessDocs: BusinessDoc[];

  @IsString()
  @IsOptional()
  @ApiProperty()
  purposeOfLoan?: string;
}
