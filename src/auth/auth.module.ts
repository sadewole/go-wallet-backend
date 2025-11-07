import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from '@/users/users.repository';
import { PasswordService } from './password.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserRepository, PasswordService],
})
export class AuthModule {}
