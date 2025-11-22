import { Module } from '@nestjs/common';
import { AdminSeedService } from '@/admin/admin-seed.service';
import { UserRepository } from '@/users/users.repository';
import { PasswordService } from '@/auth/password.service';

@Module({
  providers: [AdminSeedService, UserRepository, PasswordService],
})
export class SeedModule {}
