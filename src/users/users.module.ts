import { Module } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { PasswordService } from '@/auth/password.service';

@Module({
  providers: [UserRepository, PasswordService],
  exports: [UserRepository],
})
export class UsersModule {}
