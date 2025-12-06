import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';
import { CreditRepositoryManager } from './credit-repository.manager';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [CreditController],
  providers: [CreditService, CreditRepositoryManager],
})
export class CreditModule {}
