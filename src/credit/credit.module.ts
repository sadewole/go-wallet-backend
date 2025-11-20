import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';

@Module({
  imports: [],
  controllers: [CreditController],
  providers: [CreditService],
  exports: [],
})
export class CreditModule {}
