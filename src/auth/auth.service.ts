import { UserRepository } from '@/users/users.repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '@/users/dtos/user.dto';
import { JwtService } from '@nestjs/jwt';
import { SelectType } from '@/libs/database';
import { PasswordService } from './password.service';
import { LoginDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}

  async register(body: CreateUserDto) {
    const user = await this.userRepository.createUser(body);

    // JWT TOKEN
    // TODO: SEND EMAIL NOTIFICATION

    return this.signedUserToken(user);
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
