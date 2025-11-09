import { UserRepository } from '@/users/users.repository';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '@/users/dtos/user.dto';
import { JwtService } from '@nestjs/jwt';
import type { DBTableType } from '@/libs/database';
import { PasswordService } from './password.service';
import { LoginDto, ResendCodeDto, VerifyEmailDto } from './dtos/auth.dto';
import { CacheService } from '@/libs/cache/cache.service';
import { generateExpiryCode, REDIS_KEYS } from '@/core/utils/helpers';
import { EmailService } from '@/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private jwtService: JwtService,
    private cacheService: CacheService,
    private emailService: EmailService,
  ) {}

  async login(user: DBTableType<'users'>) {
    const loginTime = new Date();
    await this.userRepository.update(user.id, { lastLogin: loginTime });
    return this.signedUserToken(user);
  }

  async register(body: CreateUserDto) {
    const user = await this.userRepository.createUser(body);

    const { code, expiryMin } = generateExpiryCode();
    await this.cacheService.set(
      `${REDIS_KEYS.VERIFY_EMAIL_TOKEN}:${user.id}`,
      code,
      expiryMin,
    );

    await this.emailService.sendNotification({
      to: user.email,
      notificationId: 'thankYouSignUp',
      content: code,
    });

    return this.signedUserToken(user);
  }

  async resendVerificationCode(body: ResendCodeDto) {
    const user = await this.userRepository.findByEmail(body.email);
    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    const { code, expiryMin } = generateExpiryCode();
    await this.cacheService.set(
      `${REDIS_KEYS.VERIFY_EMAIL_TOKEN}:${user.id}`,
      code,
      expiryMin,
    );

    const result = await this.emailService.sendNotification({
      to: user.email,
      notificationId: 'emailVerification',
      content: code,
    });

    if (!result) {
      await this.cacheService.delete(
        `${REDIS_KEYS.VERIFY_EMAIL_TOKEN}:${user.id}`,
      );
      throw new HttpException(
        'Failed to send verification',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      success: true,
      message: 'A verification code has been sent to your email',
    };
  }

  async verifyEmail(body: VerifyEmailDto) {
    const user = await this.userRepository.findByEmail(body.email);
    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    const cachedCode = await this.cacheService.get(
      `${REDIS_KEYS.VERIFY_EMAIL_TOKEN}:${user.id}`,
    );
    if (cachedCode !== body.code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.userRepository.update(user.id, { isVerified: true });

    await this.emailService.sendNotification({
      to: user.email,
      notificationId: 'emailVerified',
    });

    await this.cacheService.delete(
      `${REDIS_KEYS.VERIFY_EMAIL_TOKEN}:${user.id}`,
    );

    return { success: true, message: 'Email verified successfully' };
  }

  signedUserToken(user: DBTableType<'users'>) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      isVerified: user.isVerified,
    };
  }

  async validateLogin(body: LoginDto): Promise<DBTableType<'users'>> {
    const user = await this.userRepository.findFirst({
      where: (users, { eq }) => eq(users.email, body.email),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid crendentials');
    }

    const isMatch = await this.passwordService.comparePassword(
      body.password,
      user.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Invalid crendentials');
    }

    delete user.password;
    return user;
  }
}
