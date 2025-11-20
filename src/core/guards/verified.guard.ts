import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class VerifiedUserGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Unauthorized access!. Please, verify your account.',
      );
    }
    return true;
  }
}
