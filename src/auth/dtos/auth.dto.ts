import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Password must not be empty' })
  @IsString()
  @ApiProperty()
  password: string;
}

export class ResendCodeDto {
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail()
  @ApiProperty()
  email: string;
}

export class VerifyEmailDto {
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Code must not be empty' })
  @Length(4, 4, {
    message: 'Code must be 4 digits',
  })
  @IsString()
  @ApiProperty()
  code: string;
}

export class AuthResponse {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  isVerified: boolean;
}

export class AuthOkResponse {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}
