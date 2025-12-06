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
import {
  excludeProps,
  generateExpiryCode,
  REDIS_KEYS,
} from '@/core/utils/helpers';
import { EmailService } from '@/email/email.service';
import { CreditRepositoryManager } from '@/credit/credit-repository.manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private jwtService: JwtService,
    private cacheService: CacheService,
    private emailService: EmailService,
    private creditRepoManager: CreditRepositoryManager,
  ) {}

  async login(user: DBTableType<'users'>) {
    const loginTime = new Date();
    await this.userRepository.update(user.id, { lastLogin: loginTime });
    return await this.signedUserToken(user);
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
    const defaultCreditLimit = 1000;
    return this.userRepository.transaction(async (tx) => {
      const txUserRepo = this.userRepository.withTransaction(tx);
      const txCreditRepo = this.creditRepoManager.credit.withTransaction(tx);

      const user = await txUserRepo.findOne({
        where: (user, { eq }) => eq(user.email, body.email),
      });

      if (user.isVerified) {
        throw new BadRequestException('Email already verified');
      }

      const cachedCode = await this.cacheService.get(
        `${REDIS_KEYS.VERIFY_EMAIL_TOKEN}:${user.id}`,
      );
      if (cachedCode !== body.code) {
        throw new UnauthorizedException('Invalid verification code');
      }

      const creditAccount = await txCreditRepo.create({
        userId: user.id,
        limit: defaultCreditLimit,
        available: defaultCreditLimit,
        outstanding: 0,
        spendableAmount: 0,
        status: 'active',
      });

      await txUserRepo.update(user.id, {
        isVerified: true,
        creditId: creditAccount.id,
      });

      await this.emailService.sendNotification({
        to: user.email,
        notificationId: 'emailVerified',
      });

      await this.cacheService.delete(
        `${REDIS_KEYS.VERIFY_EMAIL_TOKEN}:${user.id}`,
      );

      return { success: true, message: 'Email verified successfully' };
    });
  }

  async signedUserToken(user: DBTableType<'users'>) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.updateRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      isVerified: user.isVerified,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken =
      await this.passwordService.hashPassword(refreshToken);
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userRepository.findFirst({
      where: (user, { eq }) => eq(user.id, userId),
    });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await this.passwordService.comparePassword(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    return this.signedUserToken(user);
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, { refreshToken: null });
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

    return excludeProps(user, [
      'password',
      'refreshToken',
    ]) as DBTableType<'users'>;
  }
}
