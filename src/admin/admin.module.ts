import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserRepository } from '@/users/users.repository';
import { EmailService } from '@/email/email.service';
import { CreditRepositoryManager } from '@/credit/credit-repository.manager';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    UserRepository,
    EmailService,
    CreditRepositoryManager,
  ],
})
export class AdminModule {}
