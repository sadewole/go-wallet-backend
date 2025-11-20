import { Module } from '@nestjs/common';
import { AdminCreditService } from './admin-credit.service';
import { AdminCreditController } from './admin-credit.controller';

@Module({
  controllers: [AdminCreditController],
  providers: [AdminCreditService],
})
export class AdminCreditModule {}
