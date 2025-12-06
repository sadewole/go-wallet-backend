import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '@/users/dtos/user-response.dto';
import { CreditResponse } from '@/credit/dtos/credit-response.dto';

export class UserWithCreditResponse extends UserResponseDto {
  @ApiProperty({ type: CreditResponse })
  credit: CreditResponse;
}
