import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from '@/users/users.repository';
import { PasswordService } from './password.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import enviroments from '@/core/utils/enviroments';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies';
import { EmailService } from '@/email/email.service';

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
  imports: [PassportModule, JwtModuleFactory],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    PasswordService,
    JwtStrategy,
    EmailService,
  ],
  exports: [AuthService, PasswordService],
})
export class AuthModule {}
