import { UserRepository } from '@/users/users.repository';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '@/users/dtos/user.dto';
import { JwtService } from '@nestjs/jwt';
import { SelectType } from '@/libs/database';
import { PasswordService } from './password.service';
import { LoginDto, ResendCodeDto, VerifyEmailDto } from './dtos/auth.dto';
import { CacheService } from '@/libs/cache/cache.service';
import { generateExpiryCode, REDIS_KEYS } from '@/core/utils/helpers';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private jwtService: JwtService,
    private cacheService: CacheService,
  ) {}

  async login(user: SelectType<'users'>) {
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
    // TODO: SEND EMAIL NOTIFICATION

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

    // TODO: SEND CODE EMAIL

    return { message: 'A verification code has been sent to your email' };
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
    // TODO: SEND VERIFIED EMAIL

    await this.cacheService.delete(
      `${REDIS_KEYS.VERIFY_EMAIL_TOKEN}:${user.id}`,
    );

    return { message: 'Email verified successfully' };
  }

  signedUserToken(user: SelectType<'users'>) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      isVerified: user.isVerified,
    };
  }

  async validateLogin(body: LoginDto): Promise<SelectType<'users'>> {
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
