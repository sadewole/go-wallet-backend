import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { EmailService } from '@/email/email.service';
import { CreditRepositoryManager } from '@/credit/credit-repository.manager';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AdminController],
  providers: [AdminService, EmailService, CreditRepositoryManager],
})
export class AdminModule {}
