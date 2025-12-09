import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RejectApplicationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Note' })
  note: string;
}

export class AdjustCreditDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 100 })
  amount: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Description' })
  description: string;
}
