import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class ResendCodeDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(4)
  @IsString()
  code: string;
}
