import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RejectApplicationDto {
  @IsNotEmpty()
  @IsString()
  note: string;
}

export class AdjustCreditDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  description: string;
}
