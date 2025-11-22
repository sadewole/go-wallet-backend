import { IsNotEmpty, IsString } from 'class-validator';

export class RejectApplicationDto {
  @IsNotEmpty()
  @IsString()
  note: string;
}
