import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt.guard';
import { RolesEnum } from '@/users/user.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authGuard = new JwtAuthGuard();
    const isAuthPass = await authGuard.canActivate(context);
    if (!isAuthPass) {
      return false;
    }

    const { user } = context.switchToHttp().getRequest();

    return user?.role === RolesEnum.ADMIN && user?.isVerified === true;
  }
}
