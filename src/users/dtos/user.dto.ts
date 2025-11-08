import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'First name must not be empty' })
  @IsString()
  @ApiProperty()
  firstName: string;

  @IsNotEmpty({ message: 'Last name must not be empty' })
  @IsString()
  @ApiProperty()
  lastName: string;

  @IsNotEmpty({ message: 'Password must not be empty' })
  @IsString()
  @ApiProperty()
  password: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  phoneNumber: string;
}
