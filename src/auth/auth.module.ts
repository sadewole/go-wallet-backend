import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from '@/users/users.repository';
import { PasswordService } from './password.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import enviroments from '@/core/utils/enviroments';

const JwtModuleFactory = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get(enviroments.JWT_SECRET),
    signOptions: {
      expiresIn: 3600,
    },
  }),
  inject: [ConfigService],
});

@Module({
  imports: [JwtModuleFactory],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, PasswordService],
})
export class AuthModule {}
