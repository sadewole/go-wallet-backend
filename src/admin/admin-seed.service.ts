import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '@/users/users.repository';
import { getDefaultAdminData } from './data/admin-seed.data';
import { PasswordService } from '@/auth/password.service';

@Injectable()
export class AdminSeedService {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async manuallySeedAdmin() {
    return this.seedDefaultAdmin();
  }

  async seedDefaultAdmin() {
    try {
      const adminData = getDefaultAdminData();

      this.logger.log(
        `Checking for existing admin with email: ${adminData.email}`,
      );

      const existingAdmin = await this.userRepository.findOne({
        where: (user, { eq, or }) =>
          or(eq(user.email, adminData.email), eq(user.role, 'admin')),
      });

      if (existingAdmin) {
        this.logger.log(`Admin user already exists (ID: ${existingAdmin.id})`);
        return {
          success: true,
          message: 'Admin user already exists',
          adminId: existingAdmin.id,
          existed: true,
        };
      }

      const hashedPassword = await this.passwordService.hashPassword(
        adminData.password,
      );

      const admin = await this.userRepository.create({
        ...adminData,
        password: hashedPassword,
        isVerified: true,
        role: 'admin',
      });

      this.logger.log(
        `✅ Default admin user created successfully (ID: ${admin.id})`,
      );

      const result = {
        success: true,
        message: 'Admin user created successfully',
        adminId: admin.id,
        email: adminData.email,
        existed: false,
      };

      return result;
    } catch (error) {
      this.logger.error('Failed to seed default admin', error.stack);
      throw error;
    }
  }
}
