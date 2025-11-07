import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '@/users/users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt_secret'),
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findFirst({
      where: (users, { eq }) => eq(users.id, payload.sub),
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    delete user.password;
    return user;
  }
}
